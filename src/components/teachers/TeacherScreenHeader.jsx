import { View, Text, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail, Search } from "lucide-react-native";

const TeacherScreenHeader = ({
  title,
  showBackButton = true,
  onSearchChange,
  onMailPress,
}) => {
  const router = useRouter();
  const showSearch = typeof onSearchChange === "function";

  return (
    <View className="border-b border-slate-100 bg-white px-4 py-3 shadow-sm shadow-slate-200/40">
      <View className="flex-row items-center gap-3">
        {showBackButton && (
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white"
            hitSlop={10}
          >
            <ArrowLeft size={19} color="#334155" strokeWidth={2.5} />
          </Pressable>
        )}

        <Text
          className="min-w-0 flex-1 text-lg font-extrabold text-slate-900"
          numberOfLines={1}
        >
          {title}
        </Text>

        {onMailPress && (
          <Pressable
            onPress={onMailPress}
            className="h-10 w-10 items-center justify-center rounded-xl bg-primary"
            hitSlop={10}
          >
            <Mail size={18} color="#fff" strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      {showSearch && (
        <View className="mt-3 h-11 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 px-3">
          <Search size={17} color="#94A3B8" strokeWidth={2.4} />
          <TextInput
            className="ml-2 h-full flex-1 text-sm font-semibold text-slate-800"
            placeholder="Search"
            placeholderTextColor="#94A3B8"
            onChangeText={onSearchChange}
            autoCapitalize="none"
          />
        </View>
      )}
    </View>
  );
};

export default TeacherScreenHeader;
