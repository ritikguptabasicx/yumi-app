import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Picker } from "@/components/ui/picker";
import toast from "@/lib/toast";
import ScreenHeader from "@/components/ScreenHeader";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { useInstitutions } from "@/hooks/useInstitutions";
import { useAllergens } from "@/hooks/useAllergens";
import AllergyPicker from "@/components/AllergyPicker";

const AddChild = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState({
    name: "",
    id: "",
  });

  const [selectedClass, setSelectedClass] = useState({
    name: "",
    id: "",
  });

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [errors, setErrors] = useState({});
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const { schools } = useInstitutions();
  const { allergyOptions } = useAllergens();

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

  useEffect(() => {
    if (!selectedSchool.id) return;

    const fetchClasses = async () => {
      try {
        const res = await api.post("/api/v1/classes", {
          institutionId: selectedSchool.id,
        });
        const data = res.data;
        if (data.success) setClasses(data.data);
      } catch {
        toast.error(t("errors.somethingWentWrong"));
      }
    };

    fetchClasses();
  }, [selectedSchool.id, t]);

  const handleSchoolChange = (name) => {
    const s = schools.find((x) => x.name === name);
    setSelectedSchool({ name, id: s?.id?.toString() || "" });
    setSelectedClass({ name: "", id: "" });
    setSelectedTeacher("");
  };

  const handleClassChange = (name) => {
    const c = classes.find((x) => x.name === name);
    setSelectedClass({ name, id: c?.id?.toString() || "" });
    setSelectedTeacher(c?.teacherName || "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await api.post("/api/v1/child", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob
          ? format(parse(formData.dob, "yyyy-MM-dd", new Date()), "dd-MM-yyyy")
          : null,
        institutionId: selectedSchool.id,
        classId: selectedClass.id,
        allergens: selectedAllergies.map((id) => ({ allergen_id: id })),
      });

      const data = res.data;

      if (data.status === 1) {
        toast.success("Child added");
        router.replace("/(app)/(tabs)");
      } else throw new Error();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const schoolOptions = schools.map((s) => ({ label: s.name, value: s.name }));
  const classOptions =
    classes.length > 0
      ? classes.map((c) => ({ label: c.name, value: c.name }))
      : [{ label: t("child.noClassesAvailable"), value: "__none__", disabled: true }];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScreenHeader title="Add Child" />
      <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
        <View className="rounded-xl bg-white p-6 shadow-sm">
          <View className="gap-6">
            <View className="gap-4">
              <View className="gap-2">
                <Label>
                  {t("child.firstName")} <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  value={formData.firstName}
                  placeholder={t("child.enterFirstName")}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, firstName: text }))}
                  className={cn(errors.firstName && "border-red-500")}
                />
                {errors.firstName && (
                  <Text className="text-xs text-red-500">{errors.firstName}</Text>
                )}
              </View>

              <View className="gap-2">
                <Label>
                  {t("child.lastName")} <Text className="text-red-500">*</Text>
                </Label>
                <Input
                  value={formData.lastName}
                  placeholder={t("child.enterLastName")}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, lastName: text }))}
                  className={cn(errors.lastName && "border-red-500")}
                />
                {errors.lastName && (
                  <Text className="text-xs text-red-500">{errors.lastName}</Text>
                )}
              </View>
            </View>

            <View className="gap-6">
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
              className="h-11 w-full rounded-lg bg-primary"
            >
              {isLoading ? t("actions.adding") : t("child.addChild")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddChild;
