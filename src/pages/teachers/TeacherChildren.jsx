import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/Loader";
import toast from "@/lib/toast";
import TeacherScreenHeader from "@/components/teachers/TeacherScreenHeader";
import { Badge } from "@/components/ui/badge";

const TeacherChildren = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const response = await api.post("/api/v1/t/childrens", {
          userId: user.id,
        });
        setChildren(response.data?.data || []);
      } catch (error) {
        console.error("Teacher children fetch error:", error);
        toast.error(t("errors.somethingWentWrong"));
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user?.id, t]);

  const filteredChildren = useMemo(
    () =>
      children.filter((child) =>
        child.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [children, searchQuery]
  );

  if (loading) return <Loader />;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TeacherScreenHeader
        title={t("navigation.children")}
        onSearchChange={setSearchQuery}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredChildren.length ? (
          <View className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <View className="flex-row bg-slate-50 px-4 py-3">
              <Text className="w-12 text-xs font-black uppercase text-slate-400">#</Text>
              <Text className="flex-1 text-xs font-black uppercase text-slate-400">
                {t("child.childName")}
              </Text>
              <Text className="w-24 text-xs font-black uppercase text-slate-400">
                {t("child.class")}
              </Text>
            </View>
            {filteredChildren.map((child, index) => (
              <View
                key={child.childId || `${child.fullName}-${index}`}
                className="flex-row items-center border-t border-slate-100 px-4 py-4"
              >
                <Text className="w-12 text-sm font-bold text-slate-400">
                  {index + 1}
                </Text>
                <Text className="min-w-0 flex-1 pr-3 text-sm font-bold text-slate-900">
                  {child.fullName}
                </Text>
                <View className="w-24 items-start">
                  <Badge variant="outline">{child.className}</Badge>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-24">
            <Users size={44} color="#CBD5E1" strokeWidth={2.2} />
            <Text className="mt-3 text-base font-bold text-slate-400">
              {t("common.noData")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherChildren;
