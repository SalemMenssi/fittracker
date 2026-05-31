import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Alert, Modal, TextInput, ActivityIndicator, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { addCourse, getAllCourses, deleteCourse, updateCourse } from "../../services/CourseService";
import { createChallenge, getAllChallenges, deleteChallenge, updateChallenge } from "../../services/ChallengeService";
import { askSystem } from "../../services/SystemAIService";
import { API_URL } from "../../services/config";

const CATEGORIES = ["Study", "Fitness", "Discipline", "Productivity", "Mental Focus", "Health", "Skill Building", "Daily Life"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const STATUS = ["open", "expired", "completed"];
const createTask = () => ({ title: "", description: "" });
const createRule = () => ({ text: "" });
const blankForm = () => ({
  title: "",
  description: "",
  category: "Discipline",
  difficulty: "Medium",
  expReward: "50",
  levelRequirement: "1",
  duration: "30 Minutes",
  image: "",
  status: "open",
  startDate: "",
  expiryDate: "",
  tasksRows: [createTask()],
  rulesRows: [createRule()],
});

const normalizeCategory = (value) => {
  const v = String(value || "").trim().toLowerCase();
  const found = CATEGORIES.find((c) => c.toLowerCase() === v);
  return found || "Discipline";
};
const normalizeDifficulty = (value) => {
  const v = String(value || "").trim().toLowerCase();
  const found = DIFFICULTIES.find((d) => d.toLowerCase() === v);
  return found || "Medium";
};
const normalizeStatus = (value) => {
  const v = String(value || "").trim().toLowerCase();
  if (v === "active") return "open";
  const found = STATUS.find((s) => s === v);
  return found || "open";
};

export default function AdminManageScreen() {
  const [tab, setTab] = useState("routines");
  const [routines, setRoutines] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit | view
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState(blankForm());

  useEffect(() => {
    (async () => {
      const [r, c] = await Promise.all([getAllCourses(), getAllChallenges()]);
      setRoutines(r);
      setChallenges(c);
    })();
  }, []);

  const removeRoutine = (id) => Alert.alert("Delete routine?", "This cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { await deleteCourse(id); setRoutines((p) => p.filter((x) => x.id !== id)); } },
  ]);

  const removeChallenge = (id) => Alert.alert("Delete challenge?", "This cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { await deleteChallenge(id); setChallenges((p) => p.filter((x) => x.id !== id)); } },
  ]);

  const data = tab === "routines" ? routines : challenges;
  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateTask = (idx, key, val) =>
    setForm((f) => ({ ...f, tasksRows: f.tasksRows.map((t, i) => (i === idx ? { ...t, [key]: val } : t)) }));
  const addTaskRow = () => setForm((f) => ({ ...f, tasksRows: [...f.tasksRows, createTask()] }));
  const removeTaskRow = (idx) =>
    setForm((f) => ({ ...f, tasksRows: f.tasksRows.length > 1 ? f.tasksRows.filter((_, i) => i !== idx) : f.tasksRows }));
  const updateRule = (idx, val) =>
    setForm((f) => ({ ...f, rulesRows: f.rulesRows.map((r, i) => (i === idx ? { text: val } : r)) }));
  const addRuleRow = () => setForm((f) => ({ ...f, rulesRows: [...f.rulesRows, createRule()] }));
  const removeRuleRow = (idx) =>
    setForm((f) => ({ ...f, rulesRows: f.rulesRows.length > 1 ? f.rulesRows.filter((_, i) => i !== idx) : f.rulesRows }));

  const parseAiJson = (text) => {
    try {
      const clean = String(text || "").replace(/```json|```/gi, "").trim();
      const json = clean.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  };

  const autoFillWithAI = async () => {
    try {
      setAiLoading(true);
      const prompt = tab === "routines"
        ? "Return strict JSON only with keys: title, description, category, difficulty, levelRequirement, duration, status, rules(array), tasks(array of objects with title and description), image."
        : "Return strict JSON only with keys: title, description, category, difficulty, levelRequirement, expReward, status, startDate(YYYY-MM-DD), expiryDate(YYYY-MM-DD), rules(array), tasks(array of objects with title and description).";
      const text = await askSystem(prompt, { raw: true });
      const dataJson = parseAiJson(text);
      if (!dataJson) return Alert.alert("AI", "Could not parse AI suggestion.");
      const aiTasks = Array.isArray(dataJson.tasks)
        ? dataJson.tasks.map((t) => (typeof t === "string" ? { title: t, description: "Task detail" } : { title: t.title || "", description: t.description || "" }))
        : null;
      const aiRules = Array.isArray(dataJson.rules) ? dataJson.rules.map((r) => ({ text: String(r) })) : null;
      setForm((f) => ({
        ...f,
        title: dataJson.title || f.title,
        description: dataJson.description || f.description,
        category: normalizeCategory(dataJson.category || f.category),
        difficulty: normalizeDifficulty(dataJson.difficulty || f.difficulty),
        expReward: String(dataJson.expReward || f.expReward),
        levelRequirement: String(dataJson.levelRequirement || f.levelRequirement),
        duration: dataJson.duration || f.duration,
        image: dataJson.image || f.image,
        status: normalizeStatus(dataJson.status || f.status),
        startDate: dataJson.startDate || f.startDate,
        expiryDate: dataJson.expiryDate || f.expiryDate,
        tasksRows: aiTasks && aiTasks.length ? aiTasks : f.tasksRows,
        rulesRows: aiRules && aiRules.length ? aiRules : f.rulesRows,
      }));
    } catch (e) {
      Alert.alert("AI Error", e.message || "Failed to generate suggestion.");
    } finally {
      setAiLoading(false);
    }
  };

  const submitItem = async () => {
    try {
      if (!form.title.trim()) return Alert.alert("Validation", "Title is required.");
      const safeCategory = normalizeCategory(form.category);
      const safeDifficulty = normalizeDifficulty(form.difficulty);
      const safeStatus = normalizeStatus(form.status);
      setSaving(true);
      const taskList = form.tasksRows.map((t) => ({ title: (t.title || "").trim(), description: (t.description || "").trim() || "Task detail" })).filter((t) => t.title);
      const ruleList = form.rulesRows.map((r) => (r.text || "").trim()).filter(Boolean);
      if (taskList.length === 0) return Alert.alert("Validation", "Add at least one task.");
      if (tab === "routines") {
        const payload = {
          title: form.title,
          description: form.description,
          workoutType: safeCategory,
          difficulty: safeDifficulty,
          levelRequirement: Number(form.levelRequirement || 1),
          duration: form.duration || "30 Minutes",
          image: form.image || undefined,
          status: safeStatus,
          creator: "admin",
          rules: ruleList.length ? ruleList : ["Stay consistent"],
          tasks: taskList.map((t) => ({ title: t.title, description: t.description, status: "pending" })),
        };
        if (mode === "edit" && editingId) {
          const updated = await updateCourse({
            id: editingId,
            ...payload,
            Tasks: payload.tasks,
          });
          setRoutines((p) => p.map((x) => (x.id === editingId ? updated : x)));
        } else {
          const added = await addCourse(payload);
          setRoutines((p) => [added, ...p]);
        }
      } else {
        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 7);
        const payload = {
          title: form.title,
          description: form.description,
          category: safeCategory,
          difficulty: safeDifficulty,
          levelRequirement: Number(form.levelRequirement || 1),
          expReward: Number(form.expReward || 50),
          rules: ruleList.length ? ruleList : ["Finish all tasks before deadline"],
          startDate: form.startDate ? new Date(form.startDate).toISOString() : now.toISOString(),
          expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : end.toISOString(),
          tasks: taskList.map((t) => ({ title: t.title, description: t.description })),
          status: safeStatus,
        };
        if (mode === "edit" && editingId) {
          const updated = await updateChallenge(editingId, payload);
          setChallenges((p) => p.map((x) => (x.id === editingId ? updated : x)));
        } else {
          const added = await createChallenge(payload);
          setChallenges((p) => [added, ...p]);
        }
      }
      setOpen(false);
      setMode("create");
      setEditingId(null);
      setForm(blankForm());
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(blankForm());
    setOpen(true);
  };

  const openView = (item) => {
    setMode("view");
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category: normalizeCategory(item.workoutType || item.category || "Discipline"),
      difficulty: normalizeDifficulty(item.difficulty || "Medium"),
      expReward: String(item.expReward || 50),
      levelRequirement: String(item.levelRequirement || 1),
      duration: item.duration || "30 Minutes",
      image: item.image || "",
      status: normalizeStatus(item.status || "open"),
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : "",
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : "",
      tasksRows: (item.Tasks || item.tasks || []).map((t) => ({ title: t.title || "", description: t.description || "" })),
      rulesRows: (item.rules || []).map((r) => ({ text: r })),
    });
    setOpen(true);
  };

  const openEdit = (item) => {
    setMode("edit");
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      category: normalizeCategory(item.workoutType || item.category || "Discipline"),
      difficulty: normalizeDifficulty(item.difficulty || "Medium"),
      expReward: String(item.expReward || 50),
      levelRequirement: String(item.levelRequirement || 1),
      duration: item.duration || "30 Minutes",
      image: item.image || "",
      status: normalizeStatus(item.status || "open"),
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : "",
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().slice(0, 10) : "",
      tasksRows: (item.Tasks || item.tasks || []).map((t) => ({ title: t.title || "", description: t.description || "" })),
      rulesRows: (item.rules || []).map((r) => ({ text: r })),
    });
    setOpen(true);
  };

  const uploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission", "Allow gallery access first.");
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.75 });
    if (picked.canceled || !picked.assets?.length) return;
    try {
      setAiLoading(true);
      const file = picked.assets[0];
      const formData = new FormData();
      formData.append("image", {
        uri: file.uri,
        name: file.fileName || `routine-${Date.now()}.jpg`,
        type: file.mimeType || "image/jpeg",
      });
      const base = API_URL.replace(/\/api$/, "");
      const res = await fetch(`${base}/api/upload`, { method: "POST", body: formData, headers: { "Content-Type": "multipart/form-data" } });
      const path = await res.text();
      if (!res.ok) throw new Error(path || "Upload failed");
      update("image", `${base}${path.replace(/"/g, "")}`);
    } catch (e) {
      Alert.alert("Upload Error", e.message || "Failed to upload image.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{mode === "create" ? "Create" : mode === "edit" ? "Edit" : "View"} {tab === "routines" ? "Routine" : "Challenge"}</Text>
            <ScrollView>
              <TextInput editable={mode !== "view"} style={styles.input} placeholder="Title" value={form.title} onChangeText={(v) => update("title", v)} />
              <TextInput editable={mode !== "view"} style={[styles.input, { height: 90 }]} multiline placeholder="Description" value={form.description} onChangeText={(v) => update("description", v)} />
              <View style={styles.tableBlock}>
                <Text style={styles.tableTitle}>Category</Text>
                <View style={styles.chipsWrap}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c} disabled={mode === "view"} style={[styles.chip, form.category === c && styles.chipActive]} onPress={() => update("category", c)}>
                      <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.tableBlock}>
                <Text style={styles.tableTitle}>Difficulty</Text>
                <View style={styles.chipsWrap}>
                  {DIFFICULTIES.map((d) => (
                    <TouchableOpacity key={d} disabled={mode === "view"} style={[styles.chip, form.difficulty === d && styles.chipActive]} onPress={() => update("difficulty", d)}>
                      <Text style={[styles.chipText, form.difficulty === d && styles.chipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TextInput editable={mode !== "view"} style={styles.input} placeholder="Level requirement (number)" keyboardType="numeric" value={form.levelRequirement} onChangeText={(v) => update("levelRequirement", v)} />
              {tab === "routines" && <TextInput editable={mode !== "view"} style={styles.input} placeholder="Duration (e.g. 30 Minutes)" value={form.duration} onChangeText={(v) => update("duration", v)} />}
              {tab === "routines" && (
                <View style={styles.tableBlock}>
                  <Text style={styles.tableTitle}>Routine Image (Upload)</Text>
                  {form.image ? <Image source={{ uri: form.image }} style={{ width: "100%", height: 140, borderRadius: 10, marginBottom: 8 }} /> : null}
                  {mode !== "view" && <TouchableOpacity style={styles.smallBtn} onPress={uploadImage}><Text style={styles.smallBtnText}>Upload Image</Text></TouchableOpacity>}
                </View>
              )}
              {tab === "challenges" && <TextInput editable={mode !== "view"} style={styles.input} placeholder="EXP Reward" keyboardType="numeric" value={form.expReward} onChangeText={(v) => update("expReward", v)} />}
              {tab === "challenges" && <TextInput editable={mode !== "view"} style={styles.input} placeholder="Start Date (YYYY-MM-DD)" value={form.startDate} onChangeText={(v) => update("startDate", v)} />}
              {tab === "challenges" && <TextInput editable={mode !== "view"} style={styles.input} placeholder="Expiry Date (YYYY-MM-DD)" value={form.expiryDate} onChangeText={(v) => update("expiryDate", v)} />}
              <View style={styles.tableBlock}>
                <Text style={styles.tableTitle}>Status</Text>
                <View style={styles.chipsWrap}>
                  {STATUS.map((s) => (
                    <TouchableOpacity key={s} disabled={mode === "view"} style={[styles.chip, form.status === s && styles.chipActive]} onPress={() => update("status", s)}>
                      <Text style={[styles.chipText, form.status === s && styles.chipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.tableBlock}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableTitle}>Rules</Text>
                  {mode !== "view" && <TouchableOpacity onPress={addRuleRow}><Ionicons name="add-circle" size={20} color="#00c2c2" /></TouchableOpacity>}
                </View>
                {form.rulesRows.map((r, idx) => (
                  <View key={`rule-${idx}`} style={styles.rowLine}>
                    <TextInput editable={mode !== "view"} style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder={`Rule ${idx + 1}`} value={r.text} onChangeText={(v) => updateRule(idx, v)} />
                    {mode !== "view" && <TouchableOpacity onPress={() => removeRuleRow(idx)}><Ionicons name="trash-outline" size={18} color="#e74c3c" /></TouchableOpacity>}
                  </View>
                ))}
              </View>
              <View style={styles.tableBlock}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableTitle}>Tasks</Text>
                  {mode !== "view" && <TouchableOpacity onPress={addTaskRow}><Ionicons name="add-circle" size={20} color="#00c2c2" /></TouchableOpacity>}
                </View>
                {form.tasksRows.map((t, idx) => (
                  <View key={`task-${idx}`} style={styles.taskRow}>
                    <TextInput editable={mode !== "view"} style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Task title" value={t.title} onChangeText={(v) => updateTask(idx, "title", v)} />
                    <TextInput editable={mode !== "view"} style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Task description" value={t.description} onChangeText={(v) => updateTask(idx, "description", v)} />
                    {mode !== "view" && <TouchableOpacity onPress={() => removeTaskRow(idx)}><Ionicons name="trash-outline" size={18} color="#e74c3c" /></TouchableOpacity>}
                  </View>
                ))}
              </View>
              {mode !== "view" && <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={[styles.createBtn, { backgroundColor: "#111", flex: 1 }]} onPress={autoFillWithAI} disabled={aiLoading || saving}>
                  {aiLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createText}>AI Suggest</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.createBtn, { flex: 1 }]} onPress={submitItem} disabled={saving || aiLoading}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.createText}>{mode === "edit" ? "Save" : "Create"}</Text>}
                </TouchableOpacity>
              </View>}
              <TouchableOpacity onPress={() => setOpen(false)} style={{ alignSelf: "center", marginTop: 10 }}>
                <Text style={{ color: "#00c2c2", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <View style={styles.hero}>
        <View>
          <Text style={styles.title}>Control Tower</Text>
          <Text style={styles.subtitle}>Routines and challenge power management</Text>
        </View>
        <Ionicons name="game-controller-outline" size={28} color="#00c2c2" />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Ionicons name="list-outline" size={16} color="#00c2c2" /><Text style={styles.statValue}>{routines.length}</Text><Text style={styles.statLabel}>Routines</Text></View>
        <View style={styles.statCard}><Ionicons name="flash-outline" size={16} color="#ff8c42" /><Text style={styles.statValue}>{challenges.length}</Text><Text style={styles.statLabel}>Challenges</Text></View>
      </View>
      <View style={styles.tabs}>
        {["routines", "challenges"].map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.createBtn} onPress={openCreate}>
        <Ionicons name="add-outline" size={18} color="#fff" />
        <Text style={styles.createText}>Create {tab === "routines" ? "Routine" : "Challenge"}</Text>
      </TouchableOpacity>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.title}</Text>
              <Ionicons name={tab === "routines" ? "fitness-outline" : "trophy-outline"} size={16} color="#00c2c2" />
            </View>
            <Text style={styles.meta}>{item.description}</Text>
            <View style={styles.miniChart}>
              {[32, 55, 44, 80, 63].map((v, i) => <View key={i} style={[styles.chartBar, { height: v / 2 }]} />)}
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.viewBtn} onPress={() => openView(item)}><Text style={styles.viewText}>View</Text></TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => (tab === "routines" ? removeRoutine(item.id) : removeChallenge(item.id))}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8", padding: 20 },
  hero: { backgroundColor: "#111", borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  subtitle: { marginTop: 4, color: "#bbb", fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 10 },
  statValue: { marginTop: 4, fontSize: 18, color: "#111", fontWeight: "800" },
  statLabel: { marginTop: 2, color: "#888", fontSize: 11 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tab: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#e5e5e5", paddingHorizontal: 12, paddingVertical: 8 },
  tabActive: { backgroundColor: "#00c2c2", borderColor: "#00c2c2" },
  tabText: { color: "#666", fontWeight: "700", fontSize: 12 },
  tabTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "700", color: "#111" },
  meta: { marginTop: 4, color: "#666", fontSize: 12 },
  miniChart: { marginTop: 10, height: 42, flexDirection: "row", alignItems: "flex-end", gap: 6 },
  chartBar: { width: 8, borderRadius: 4, backgroundColor: "#00c2c2" },
  actionRow: { marginTop: 10, flexDirection: "row", gap: 8 },
  viewBtn: { backgroundColor: "#e8f9f9", paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10 },
  viewText: { color: "#00c2c2", fontWeight: "700", fontSize: 12 },
  editBtn: { backgroundColor: "#f3f4f6", paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10 },
  editText: { color: "#555", fontWeight: "700", fontSize: 12 },
  deleteBtn: { backgroundColor: "#fee2e2", paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10 },
  deleteText: { color: "#e74c3c", fontWeight: "700", fontSize: 12 },
  createBtn: { marginBottom: 12, backgroundColor: "#00c2c2", borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  createText: { color: "#fff", fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: "88%" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 10, marginBottom: 10, color: "#111" },
  tableBlock: { backgroundColor: "#f9fbfc", borderWidth: 1, borderColor: "#eef2f3", borderRadius: 10, padding: 10, marginBottom: 10 },
  tableHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  tableTitle: { fontSize: 13, fontWeight: "700", color: "#111" },
  rowLine: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  smallBtn: { backgroundColor: "#111", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  smallBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  chip: { backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#e5e5e5", paddingHorizontal: 10, paddingVertical: 7 },
  chipActive: { backgroundColor: "#00c2c2", borderColor: "#00c2c2" },
  chipText: { color: "#666", fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
});
