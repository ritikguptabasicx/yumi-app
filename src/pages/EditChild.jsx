import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppImage from "@/components/AppImage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Picker } from "@/components/ui/picker";
import { useUser } from "@/contexts/UserContext";
import { useChildren } from "@/hooks/useChildren";
import toast from "@/lib/toast";
import ScreenHeader from "@/components/ScreenHeader";
import { format, parse } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { useInstitutions } from "@/hooks/useInstitutions";
import { useAllergens } from "@/hooks/useAllergens";
import AllergyPicker from "@/components/AllergyPicker";
import { images } from "@/lib/assets";

const EditChild = () => {
  const router = useRouter();
  const { user } = useUser();
  const { children, isChildrenLoading, mutateChildren } = useChildren();
  const { t } = useTranslation();

  const selectedChild = useMemo(() => {
    if (!user?.selectedChildId || !children) return null;
    return children.find((c) => c.id === user.selectedChildId) || null;
  }, [user?.selectedChildId, children]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [classes, setClasses] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState({ name: "", id: "" });
  const [selectedClass, setSelectedClass] = useState({ name: "", id: "" });
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const { schools } = useInstitutions();
  const { allergyOptions } = useAllergens();

  useEffect(() => {
    if (selectedChild) {
      setFormData({
        firstName: selectedChild.firstName || "",
        lastName: selectedChild.lastName || "",
        dob: selectedChild.dob
          ? format(parse(selectedChild.dob, "dd-MM-yyyy", new Date()), "yyyy-MM-dd")
          : "",
      });
      setSelectedImage(selectedChild.profilePictureURL || null);
      setSelectedSchool({
        name: selectedChild.school?.name || "",
        id: selectedChild.school?.id || "",
      });
      setSelectedClass({
        name: selectedChild.school?.class?.[0]?.name || "",
        id: selectedChild.school?.class?.[0]?.id || "",
      });
      setSelectedTeacher(selectedChild.school?.class?.[0]?.teacherName || "");
      setSelectedAllergies(selectedChild.allergens?.map((a) => a.id) || []);
    }
  }, [selectedChild]);

  useEffect(() => {
    if (!isChildrenLoading && !selectedChild) {
      router.replace("/(app)/(tabs)");
    }
  }, [selectedChild, isChildrenLoading, router]);

  useEffect(() => {
    if (!selectedSchool.id) return;

    const fetchClasses = async () => {
      try {
        const classesResponse = await api.post("/api/v1/classes", {
          institutionId: selectedSchool.id,
        });
        const classesData = classesResponse.data;
        if (classesData.success) {
          setClasses(classesData.data);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error(t("errors.somethingWentWrong"));
      }
    };

    fetchClasses();
  }, [selectedSchool.id, t]);

  const handleSchoolChange = (schoolName) => {
    const schoolData = schools.find((s) => s.name === schoolName);
    setSelectedSchool({
      name: schoolName,
      id: schoolData?.id,
    });
    setSelectedClass({ name: "", id: "" });
    setSelectedTeacher("");
  };

  const handleClassChange = (className) => {
    const classData = classes.find((c) => c.name === className);
    setSelectedClass({
      name: className,
      id: classData?.id,
    });
    setSelectedTeacher(classData?.teacherName || "");
  };

  const handleImageUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error(t("errors.failedToUploadImage"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageLoading(true);
    const uploadData = new FormData();
    uploadData.append("profileImage", {
      uri: asset.uri,
      type: asset.mimeType || "image/jpeg",
      name: asset.fileName || "profile.jpg",
    });
    uploadData.append("userId", user?.id.toString());
    uploadData.append("childId", user?.selectedChildId.toString());

    try {
      const response = await api.post("/api/v1/user/upload/profile", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;

      if (data.success) {
        setSelectedImage(data.imageUrl);
        toast.success(t("status.profilePictureUpdated"));
      } else {
        toast.error(t("errors.failedToUploadImage"));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(t("errors.failedToUploadImage"));
    } finally {
      setImageLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("validation.firstNameRequired");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("validation.lastNameRequired");
    }
    if (!selectedSchool.id) {
      newErrors.school = t("validation.schoolRequired");
    }
    if (!selectedClass.id) {
      newErrors.class = t("validation.classRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await api.patch("/api/v1/child", {
        childId: user?.selectedChildId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob
          ? format(parse(formData.dob, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")
          : null,
        institutionId: Number(selectedSchool.id),
        classId: Number(selectedClass.id),
        profilePictureURL: selectedImage,
        allergens: selectedAllergies.map((id) => ({ allergen_id: id })),
      });

      const data = response.data;

      if (data.status === 1) {
        await mutateChildren();
        toast.success(t("status.profileUpdated"));
        router.replace("/(app)/(tabs)");
      } else {
        throw new Error(t("status.updateFailed"));
      }
    } catch (error) {
      console.error("Error updating child profile:", error);
      toast.error(t("status.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isChildrenLoading || !selectedChild) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScreenHeader title={t("child.editChildProfile")} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#019C7F" />
        </View>
      </SafeAreaView>
    );
  }

  const schoolOptions = schools.map((s) => ({ label: s.name, value: s.name }));
  const classOptions = classes.map((c) => ({ label: c.name, value: c.name }));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title={t("child.editChildProfile")} />
      <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
        <View className="rounded-xl bg-white p-6 shadow-sm">
          <View className="gap-6">
            <View className="items-center gap-4 border-b border-gray-100 pb-6">
              <Avatar className="h-28 w-28 rounded-md">
                <AvatarImage source={selectedImage || ""} />
                <AvatarFallback className="bg-avatarBg">
                  <AppImage source={images.placeholder} width={64} height={64} contentFit="contain" />
                </AvatarFallback>
              </Avatar>

              <Pressable
                onPress={handleImageUpload}
                disabled={imageLoading}
                className="flex-row items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5"
              >
                {imageLoading ? (
                  <ActivityIndicator size="small" color="#019C7F" />
                ) : (
                  <ImagePlus size={16} color="#374151" />
                )}
                <Text className="font-medium text-gray-700">
                  {imageLoading ? t("actions.uploading") : t("media.uploadPicture")}
                </Text>
              </Pressable>
            </View>

            <View className="gap-6">
              <View>
                <Label>
                  {t("child.firstName")} <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  value={formData.firstName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, firstName: text }))}
                  className={cn("mt-1.5", errors?.firstName && "border-red-500")}
                  placeholder={t("child.enterFirstName")}
                />
                {errors?.firstName && (
                  <Text className="mt-1 text-sm text-red-500">{errors.firstName}</Text>
                )}
              </View>

              <View>
                <Label>
                  {t("child.lastName")} <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  value={formData.lastName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, lastName: text }))}
                  className={cn("mt-1.5", errors?.lastName && "border-red-500")}
                  placeholder={t("child.enterLastName")}
                />
                {errors?.lastName && (
                  <Text className="mt-1 text-sm text-red-500">{errors.lastName}</Text>
                )}
              </View>
            </View>

            <View>
              <Label>
                {t("child.school")} <Text className="text-red-500">*</Text>
              </Label>
              <Picker
                value={selectedSchool.name}
                onValueChange={handleSchoolChange}
                options={schoolOptions}
                placeholder={t("child.selectSchool")}
                className={cn(errors?.school && "border-red-500")}
              />
              {errors?.school && (
                <Text className="mt-1 text-sm text-red-500">{errors.school}</Text>
              )}
            </View>

            <View>
              <Label>
                {t("child.grade")} <Text className="text-red-500">*</Text>
              </Label>
              <Picker
                value={selectedClass.name}
                onValueChange={handleClassChange}
                options={classOptions}
                placeholder={t("child.selectClass")}
                disabled={!selectedSchool.id}
                className={cn(errors?.class && "border-red-500")}
              />
              {errors?.class && (
                <Text className="mt-1 text-sm text-red-500">{errors.class}</Text>
              )}
            </View>

            {selectedTeacher ? (
              <View>
                <Label>{t("child.teacherName")}</Label>
                <Input value={selectedTeacher} editable={false} className="mt-1.5 bg-gray-50" />
              </View>
            ) : null}

            <AllergyPicker
              allergyOptions={allergyOptions}
              selectedAllergies={selectedAllergies}
              setSelectedAllergies={setSelectedAllergies}
            />

            <Button
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              className={cn("mt-8 w-full rounded-lg bg-primary", isLoading && "opacity-70")}
            >
              {isLoading ? t("actions.updating") : t("actions.saveChanges")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditChild;
