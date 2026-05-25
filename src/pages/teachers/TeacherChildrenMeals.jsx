import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import useSWR from "swr";
import {
  CalendarDays,
  Check,
  Clock,
  Inbox,
  Mail,
  PackageCheck,
  RotateCcw,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/apiClient";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/Loader";
import toast from "@/lib/toast";
import TeacherScreenHeader from "@/components/teachers/TeacherScreenHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialsFor = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const TeacherChildrenMeals = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [expanded, setExpanded] = useState({});
  const currentDate = useMemo(() => new Date(), []);
  const currentDateString = useMemo(
    () => currentDate.toISOString().split("T")[0],
    [currentDate]
  );

  const { data, isLoading, mutate } = useSWR(
    user?.id
      ? ["teacher-children-info", user.id, currentDateString]
      : null,
    async ([, userId, weekDate]) => {
      const response = await api.post("/api/v1/t/children-info", {
        userId,
        weekDate,
      });
      const json = response.data;
      if (!json?.success) throw new Error("Failed to fetch children meals");
      const { weekInfo, childrens } = json.data;
      return {
        weekInfo,
        orders: Array.isArray(childrens) ? childrens : [childrens],
      };
    },
    {
      revalidateOnFocus: false,
      onError: () => toast.error(t("errors.somethingWentWrong")),
    }
  );

  const orders = data?.orders ?? [];
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order?.childName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(order?.orderNumber || "").includes(searchQuery)
      ),
    [orders, searchQuery]
  );
  const visibleOrders = filteredOrders.filter((order) =>
    activeTab === "pending"
      ? order.deliveredStatus === "Pending"
      : order.deliveredStatus === "Delivered"
  );

  const handleDeliver = async (order) => {
    try {
      const response = await api.post("/api/v1/t/update-delivery-status", {
        orderId: order.salesOrderId,
        weekDayId: order.weekDayId,
        userId: user.id,
        status: "Delivered",
      });
      if (response.data?.status !== 1) throw new Error("Delivery failed");
      toast.success(t("childrenMeals.deliveredSuccess"));
      mutate();
    } catch {
      toast.error(t("errors.somethingWentWrong"));
    }
  };

  const handleUndo = async (order) => {
    try {
      const response = await api.post("/api/v1/t/undo-delivery", {
        weekDayId: order.weekDayId,
        userId: user.id,
      });
      if (response.data?.status !== 1) throw new Error("Undo failed");
      toast.success(t("childrenMeals.undoSuccess"));
      mutate();
    } catch {
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setConfirmOrder(null);
    }
  };

  const sendReport = async () => {
    const emailMatch =
      user?.emailAddress?.trim().toLowerCase() ===
      verificationEmail.trim().toLowerCase();
    if (!emailMatch) return;

    setSendingReport(true);
    try {
      const response = await api.post("/api/v1/t/request-children-report", {
        emailAddress: user.emailAddress,
        userId: user.id,
      });
      if (response.data?.status !== 1) throw new Error("Report failed");
      toast.success(t("childrenMeals.reportSuccess"));
      setEmailDialogOpen(false);
      setVerificationEmail("");
    } catch {
      toast.error(t("errors.somethingWentWrong"));
    } finally {
      setSendingReport(false);
    }
  };

  const renderOrder = (order) => {
    const key = String(order.childId || order.orderNumber);
    const isExpanded = !!expanded[key];

    return (
      <View key={key} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/60">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Text className="font-black text-white">{initialsFor(order.childName)}</Text>
          </View>

          <Pressable
            onPress={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
            className="min-w-0 flex-1"
          >
            <Text className="text-base font-black text-slate-900" numberOfLines={1}>
              {order.childName}
            </Text>
            <Text className="mt-0.5 text-xs font-semibold text-slate-500">
              {t("childrenMeals.class")} : {order.classSection}
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              <Badge variant="secondary">#{order.orderNumber}</Badge>
              <Text className="text-xs font-semibold text-slate-400">
                {order.totalItems} {t("childrenMeals.itemsLabel")}
              </Text>
            </View>
          </Pressable>

          {activeTab === "pending" ? (
            <Button size="sm" onPress={() => handleDeliver(order)} className="rounded-xl">
              <Check size={15} color="#fff" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onPress={() => setConfirmOrder(order)}
              className="rounded-xl"
            >
              <RotateCcw size={15} color="#334155" />
            </Button>
          )}
        </View>

        {isExpanded && (
          <View className="mt-4 gap-2 border-t border-slate-100 pt-3">
            {order.selectedMeals?.map((meal, index) => (
              <View key={`${meal.itemName}-${index}`} className="rounded-xl bg-slate-50 p-3">
                <Text className="text-sm font-bold text-slate-800">{meal.itemName}</Text>
                <Text className="mt-0.5 text-xs font-semibold text-slate-400">
                  {meal.category} · {t("childrenMeals.qty")} {meal.qty}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TeacherScreenHeader
        title={t("navigation.childrenMeals")}
        onSearchChange={setSearchQuery}
        onMailPress={() => setEmailDialogOpen(true)}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {data?.weekInfo && (
          <View className="mb-5 flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
            <View className="flex-row items-center gap-3">
              <CalendarDays size={20} color="#019C7F" strokeWidth={2.5} />
              <View>
                <Text className="font-black text-slate-900">
                  {t("childrenMeals.weekLabel")} {data.weekInfo.weekNumber}
                </Text>
                <Text className="mt-0.5 text-xs font-semibold text-slate-400">
                  {format(new Date(data.weekInfo.weekStartDate), "MMM dd")} -{" "}
                  {format(new Date(data.weekInfo.weekEndDate), "MMM dd")}
                </Text>
              </View>
            </View>
            <Badge variant="outline">{format(currentDate, "MMM dd")}</Badge>
          </View>
        )}

        <View className="mb-4 flex-row rounded-2xl bg-slate-100 p-1">
          {[
            ["pending", Clock],
            ["delivered", PackageCheck],
          ].map(([tab, Icon]) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl ${active ? "bg-primary" : ""}`}
              >
                <Icon size={16} color={active ? "#fff" : "#64748B"} strokeWidth={2.5} />
                <Text className={`text-sm font-black ${active ? "text-white" : "text-slate-500"}`}>
                  {t(`childrenMeals.${tab}Tab`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <Loader />
        ) : visibleOrders.length ? (
          <View className="gap-3">{visibleOrders.map(renderOrder)}</View>
        ) : (
          <View className="items-center justify-center py-24">
            <Inbox size={44} color="#CBD5E1" strokeWidth={2.2} />
            <Text className="mt-3 text-base font-black text-slate-600">
              {activeTab === "pending"
                ? t("childrenMeals.pendingTitle")
                : t("childrenMeals.deliveredTitle")}
            </Text>
            <Text className="mt-1 text-center text-sm font-semibold text-slate-400">
              {activeTab === "pending"
                ? t("childrenMeals.pendingDescription")
                : t("childrenMeals.deliveredDescription")}
            </Text>
          </View>
        )}
      </ScrollView>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogTitle>{t("childrenMeals.reportTitle")}</DialogTitle>
          <DialogDescription className="mt-2">
            {t("childrenMeals.reportDescription")} : {user?.emailAddress}
          </DialogDescription>
          <View className="mt-4 gap-3">
            <Input
              value={verificationEmail}
              onChangeText={setVerificationEmail}
              placeholder={t("childrenMeals.reportEmailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              onPress={sendReport}
              loading={sendingReport}
              disabled={
                sendingReport ||
                user?.emailAddress?.trim().toLowerCase() !==
                  verificationEmail.trim().toLowerCase()
              }
              className="rounded-xl"
            >
              <Mail size={16} color="#fff" />
              <Text className="font-bold text-white">{t("childrenMeals.reportSend")}</Text>
            </Button>
            <Button
              variant="outline"
              onPress={() => setEmailDialogOpen(false)}
              className="rounded-xl"
            >
              {t("actions.back")}
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmOrder} onOpenChange={() => setConfirmOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("childrenMeals.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("childrenMeals.confirmUndo")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setConfirmOrder(null)}>
              {t("childrenMeals.confirmCancel")}
            </AlertDialogCancel>
            <AlertDialogAction onPress={() => handleUndo(confirmOrder)}>
              {t("childrenMeals.confirmYes")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
};

export default TeacherChildrenMeals;
