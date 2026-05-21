import { useState, useMemo } from "react";
import { View, Text, Pressable, Modal, FlatList, TextInput } from "react-native";
import { Check, ChevronsUpDown, X } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AllergyPicker = ({ allergyOptions, selectedAllergies, setSelectedAllergies }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return allergyOptions;
    const q = search.toLowerCase();
    return allergyOptions.filter((item) => item.name?.toLowerCase().includes(q));
  }, [allergyOptions, search]);

  const toggleAllergy = (id) => {
    setSelectedAllergies((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <View>
      <Label className="mb-2">Allergies</Label>

      <Button variant="outline" onPress={() => setOpen(true)} className="w-full flex-row justify-between">
        <Text className="text-foreground">Select allergies (if any)</Text>
        <ChevronsUpDown size={16} color="#64748B" />
      </Button>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-overlay">
          <View className="max-h-96 rounded-t-2xl bg-card pb-8">
            <View className="border-b border-border px-4 py-3">
              <Text className="text-lg font-semibold text-foreground">Select allergies</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search allergies..."
                placeholderTextColor="#94A3B8"
                className="mt-3 h-10 rounded-md border border-input bg-background px-3 text-foreground"
              />
            </View>
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const selected = selectedAllergies.includes(item.id);
                return (
                  <Pressable
                    className="flex-row items-center border-b border-border px-4 py-4"
                    onPress={() => toggleAllergy(item.id)}
                  >
                    <Check
                      size={16}
                      color="#019C7F"
                      style={{ opacity: selected ? 1 : 0, marginRight: 8 }}
                    />
                    <Text className="text-base text-foreground">{item.name}</Text>
                  </Pressable>
                );
              }}
            />
            <Pressable className="mx-4 mt-2 rounded-md bg-primary py-3" onPress={() => setOpen(false)}>
              <Text className="text-center font-medium text-white">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {selectedAllergies.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {selectedAllergies.map((id) => {
            const allergy = allergyOptions.find((a) => a.id === id);
            return (
              <View
                key={id}
                className="flex-row items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
              >
                <Text className="text-sm text-gray-800">{allergy?.name || id}</Text>
                <Pressable onPress={() => toggleAllergy(id)}>
                  <X size={14} color="#6B7280" />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default AllergyPicker;
