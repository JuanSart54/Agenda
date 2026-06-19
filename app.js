const STORAGE_KEY = "agenda.pro.tasks.v1";
const AGENTS_KEY = "agenda.pro.agents.v1";
const GUESTS_KEY = "agenda.pro.guests.v1";
const ANALYTICS_KEY = "agenda.pro.analytics.v1";
const USER_SETTINGS_KEY = "agenda.pro.userSettings.v1";
const LAST_GALLERY_VIEW_KEY = "agenda.pro.lastGalleryView.v1";
const WHATSAPP_REMINDER_KEY = "agenda.pro.whatsappReminders.v1";
const MAX_LOCAL_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const MAX_LOCAL_BATCH_BYTES = 20 * 1024 * 1024;
const categories = ["Personal", "Obra", "Mantenimiento", "Medico", "Finca", "Administracion", "Empleados", "Incidencias", "Compras", "Legal", "Otra"];
const statusLabels = {
  new: "Nueva",
  active: "Comenzada",
  paused: "PAUSA / NO CONTINUAR",
  done: "Terminada"
};
const typeLabels = {
  personal: "Personal",
  shared: "Compartida",
  permanent: "Permanente"
};
const contractStatusLabels = {
  draft: "Borrador",
  sent: "Enviado",
  opened: "Abierto por agente",
  change_requested: "Cambios solicitados",
  unlocked: "Desbloqueado",
  signed: "Firmado certificado",
  cancelled: "Cancelado"
};

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

const els = {
  taskList: document.querySelector("#taskList"),
  detailPanel: document.querySelector("#detailPanel"),
  resultTitle: document.querySelector("#resultTitle"),
  resultCount: document.querySelector("#resultCount"),
  categoryFilter: document.querySelector("#categoryFilter"),
  categoryInput: document.querySelector("#categoryInput"),
  progressBars: document.querySelector("#progressBars"),
  galleryPanel: document.querySelector("#galleryPanel"),
  galleryGrid: document.querySelector("#galleryGrid"),
  photoSearch: document.querySelector("#photoSearchInput"),
  alarmsPanel: document.querySelector("#alarmsPanel"),
  alarmList: document.querySelector("#alarmList"),
  dialog: document.querySelector("#taskDialog"),
  agentDialog: document.querySelector("#agentDialog"),
  agentForm: document.querySelector("#agentForm"),
  agentList: document.querySelector("#agentList"),
  guestDialog: document.querySelector("#guestDialog"),
  guestForm: document.querySelector("#guestForm"),
  guestList: document.querySelector("#guestList"),
  contractList: document.querySelector("#contractList"),
  contractCount: document.querySelector("#contractCount"),
  configDialog: document.querySelector("#configDialog"),
  configForm: document.querySelector("#configForm"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  permissionDialog: document.querySelector("#permissionDialog"),
  permissionForm: document.querySelector("#permissionForm"),
  contractDialog: document.querySelector("#contractDialog"),
  contractForm: document.querySelector("#contractForm"),
  mediaViewerDialog: document.querySelector("#mediaViewerDialog"),
  mediaViewerStage: document.querySelector("#mediaViewerStage"),
  mediaViewerTitle: document.querySelector("#mediaViewerTitle"),
  mediaViewerScope: document.querySelector("#mediaViewerScope"),
  mediaViewerMeta: document.querySelector("#mediaViewerMeta"),
  inboxDialog: document.querySelector("#inboxDialog"),
  invitationList: document.querySelector("#invitationList"),
  inboxStatus: document.querySelector("#inboxStatus"),
  form: document.querySelector("#taskForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  submitTaskButton: document.querySelector("#submitTaskButton"),
  template: document.querySelector("#taskCardTemplate")
};

const filters = {
  search: document.querySelector("#searchInput"),
  status: document.querySelector("#statusFilter"),
  type: document.querySelector("#typeFilter"),
  category: document.querySelector("#categoryFilter"),
  media: document.querySelector("#mediaFilter"),
  sort: document.querySelector("#sortInput")
};

const contractFilters = {
  search: document.querySelector("#contractSearchInput"),
  agent: document.querySelector("#contractAgentFilter"),
  status: document.querySelector("#contractStatusFilter"),
  sort: document.querySelector("#contractSortFilter")
};

const fields = {
  title: document.querySelector("#titleInput"),
  type: document.querySelector("#typeInput"),
  status: document.querySelector("#statusInput"),
  due: document.querySelector("#dueInput"),
  reminder: document.querySelector("#reminderInput"),
  category: document.querySelector("#categoryInput"),
  priority: document.querySelector("#priorityInput"),
  keywords: document.querySelector("#keywordsInput"),
  agents: document.querySelector("#agentsInput"),
  agentSelect: document.querySelector("#agentSelectInput"),
  viewers: document.querySelector("#viewersInput"),
  viewerSelect: document.querySelector("#viewerSelectInput"),
  description: document.querySelector("#descriptionInput"),
  progress: document.querySelector("#progressInput"),
  photo: document.querySelector("#photoInput"),
  photoSource: document.querySelector("#photoSourceInput"),
  sourceDevice: document.querySelector("#sourceDeviceButton"),
  sourceCamera: document.querySelector("#sourceCameraButton"),
  sourceMic: document.querySelector("#sourceMicButton"),
  gps: document.querySelector("#gpsInput"),
  files: document.querySelector("#filesInput"),
  attachmentStatus: document.querySelector("#attachmentStatus")
};

const agentFields = {
  title: document.querySelector("#agentDialogTitle"),
  name: document.querySelector("#agentNameInput"),
  phone: document.querySelector("#agentPhoneInput"),
  email: document.querySelector("#agentEmailInput")
};

const guestFields = {
  title: document.querySelector("#guestDialogTitle"),
  name: document.querySelector("#guestNameInput"),
  phone: document.querySelector("#guestPhoneInput"),
  email: document.querySelector("#guestEmailInput")
};

const configFields = {
  ownerPhone: document.querySelector("#ownerPhoneInput"),
  storagePreference: document.querySelector("#storagePreferenceInput"),
  autoWhatsapp: document.querySelector("#autoWhatsappInput"),
  whatsappReminderStatus: document.querySelector("#whatsappReminderStatus"),
  whatsappEndpointStatus: document.querySelector("#whatsappEndpointStatus"),
  localStorageStatus: document.querySelector("#localStorageStatus"),
  importDataInput: document.querySelector("#importDataInput")
};

const authFields = {
  email: document.querySelector("#authEmailInput"),
  password: document.querySelector("#authPasswordInput"),
  mode: document.querySelector("#authModeInput"),
  status: document.querySelector("#authStatus")
};

const permissionFields = {
  title: document.querySelector("#permissionDialogTitle"),
  guest: document.querySelector("#permissionGuestInput"),
  scope: document.querySelector("#permissionScopeInput"),
  subtask: document.querySelector("#permissionSubtaskInput"),
  status: document.querySelector("#permissionStatusInput"),
  note: document.querySelector("#permissionStatusNote")
};

const contractFields = {
  title: document.querySelector("#contractDialogTitle"),
  contractTitle: document.querySelector("#contractTitleInput"),
  recipient: document.querySelector("#contractRecipientInput"),
  file: document.querySelector("#contractFileInput"),
  note: document.querySelector("#contractNoteInput"),
  status: document.querySelector("#contractStatusNote")
};

let tasks = loadTasks();
let agentDirectory = loadAgents();
let guestDirectory = loadGuests();
let cloudStore = null;
let lastFilterSignature = "";
let galleryOpen = false;
let alarmsOpen = false;
let selectedAgentName = "";
let selectedAgentFilter = "pending";
let selectedGuestName = "";
let selectedGuestFilter = "active";
let analytics = loadAnalytics();
let userSettings = loadUserSettings();
let whatsappReminderState = loadWhatsappReminderState();
let selectedSummaryView = "";
const importedTask = readSharedTaskFromUrl();
if (importedTask) {
  tasks.unshift(importedTask);
  saveTasks();
  clearImportFromUrl();
}
const acceptedSubtask = readAcceptedSubtaskFromUrl();
if (acceptedSubtask) {
  tasks.unshift(acceptedSubtask);
  saveTasks();
  clearImportFromUrl();
}
const acceptedGuestView = readAcceptedGuestViewFromUrl();
if (acceptedGuestView) {
  tasks.unshift(acceptedGuestView);
  saveTasks();
  clearImportFromUrl();
}
normalizeReviewState();
let selectedId = tasks[0]?.id || null;
let editingId = null;
let dialogMode = "task";
let subtaskParentId = "";
let editingSubtaskId = "";
let permissionContext = { taskId: "", subtaskId: "" };
let highlightedFromGallery = { taskId: "", subtaskId: "" };
let editingAgentId = "";
let editingGuestId = "";
let mediaViewerItems = [];
let mediaViewerIndex = 0;
let lastGalleryMediaItems = [];
let contractContext = { taskId: "", subtaskId: "" };
let remoteUnsubscribe = null;
let incomingInvitationsUnsubscribe = null;
let sentInvitationsUnsubscribe = null;
let lastRemoteSignature = "";
let incomingInvitations = [];
let sentInvitations = [];

setupOptions();
bindEvents();
render();
initSync();
watchFilterValues();
trackEvent("opens");
processWhatsappReminders();

function setupOptions() {
  categories.forEach((category) => {
    els.categoryFilter.append(new Option(category, category));
    els.categoryInput.append(new Option(category, category));
  });
  refreshAgentSelectOptions();
  refreshViewerSelectOptions();
}

function refreshAgentSelectOptions(selectedName = "") {
  fields.agentSelect.innerHTML = "";
  fields.agentSelect.append(new Option("Selecciona agente...", ""));
  agentDirectory.forEach((agent) => {
    fields.agentSelect.append(new Option(agent.name, agent.name));
  });
  fields.agentSelect.value = selectedName && agentDirectory.some((agent) => agent.name === selectedName) ? selectedName : "";
}

function addSelectedAgentToForm() {
  const selected = fields.agentSelect.value;
  if (!selected) return;
  if (dialogMode === "subtask") {
    fields.agents.value = selected;
    return;
  }
  const current = splitList(fields.agents.value);
  if (!current.some((name) => name.toLowerCase() === selected.toLowerCase())) {
    fields.agents.value = [...current, selected].join(", ");
  }
}

function refreshViewerSelectOptions(selectedName = "") {
  fields.viewerSelect.innerHTML = "";
  fields.viewerSelect.append(new Option("Selecciona invitado...", ""));
  guestDirectory.forEach((guest) => {
    fields.viewerSelect.append(new Option(guest.name, guest.name));
  });
  fields.viewerSelect.value = selectedName && guestDirectory.some((guest) => guest.name === selectedName) ? selectedName : "";
}

function addSelectedViewerToForm() {
  const selected = fields.viewerSelect.value;
  if (!selected) return;
  const current = splitList(fields.viewers.value);
  if (!current.some((name) => name.toLowerCase() === selected.toLowerCase())) {
    fields.viewers.value = [...current, selected].join(", ");
  }
}

function bindEvents() {
  document.querySelector("#newTaskButton").addEventListener("click", () => openDialog());
  document.querySelector("#closeDialogButton").addEventListener("click", closeDialog);
  document.querySelector("#cancelButton").addEventListener("click", closeDialog);
  document.querySelector("#resetFiltersButton").addEventListener("click", resetFilters);
  document.querySelector("#seedButton").addEventListener("click", seedExampleData);
  document.querySelector("#galleryButton").addEventListener("click", openGallery);
  document.querySelector("#closeGalleryButton").addEventListener("click", closeGallery);
  document.querySelector("#alarmsButton").addEventListener("click", openAlarms);
  document.querySelector("#closeAlarmsButton").addEventListener("click", closeAlarms);
  els.photoSearch.addEventListener("input", renderGallery);
  document.querySelector("#openShareInfoButton").addEventListener("click", openShareInfo);
  document.querySelector("#closeShareInfoButton").addEventListener("click", closeShareInfo);
  document.querySelector("#shareWhatsappButton").addEventListener("click", shareAppByWhatsapp);
  document.querySelector("#shareSmsButton").addEventListener("click", shareAppBySms);
  document.querySelector("#shareEmailButton").addEventListener("click", shareAppByEmail);
  document.querySelector("#openOwnerStatsButton").addEventListener("click", openOwnerStats);
  document.querySelector("#closeOwnerStatsButton").addEventListener("click", closeOwnerStats);
  document.querySelector("#openAuthButton").addEventListener("click", openAuthDialog);
  document.querySelector("#closeAuthDialogButton").addEventListener("click", closeAuthDialog);
  document.querySelector("#signOutButton").addEventListener("click", signOutAgenda);
  document.querySelector("#inboxButton").addEventListener("click", openInboxDialog);
  document.querySelector("#closeInboxDialogButton").addEventListener("click", closeInboxDialog);
  document.querySelector("#togglePasswordButton").addEventListener("click", togglePasswordVisibility);
  document.querySelector("#resetPasswordButton").addEventListener("click", resetAgendaPassword);
  document.querySelector("#configButton").addEventListener("click", openConfigDialog);
  document.querySelector("#closeConfigDialogButton").addEventListener("click", closeConfigDialog);
  document.querySelector("#cancelConfigButton").addEventListener("click", closeConfigDialog);
  fields.photoSource.addEventListener("change", updateMediaCaptureMode);
  fields.agentSelect.addEventListener("change", addSelectedAgentToForm);
  fields.viewerSelect.addEventListener("change", addSelectedViewerToForm);
  fields.sourceDevice.addEventListener("click", () => setPhotoSource("library"));
  fields.sourceCamera.addEventListener("click", () => setPhotoSource("app"));
  fields.sourceMic.addEventListener("click", () => setPhotoSource("microphone"));
  fields.photo.addEventListener("change", updateAttachmentStatus);
  fields.files.addEventListener("change", updateAttachmentStatus);
  document.querySelector("#exportDataButton").addEventListener("click", exportLocalData);
  document.querySelector("#importDataButton").addEventListener("click", () => configFields.importDataInput.click());
  configFields.importDataInput.addEventListener("change", importLocalData);
  document.querySelector("#closePermissionDialogButton").addEventListener("click", closePermissionDialog);
  document.querySelector("#cancelPermissionButton").addEventListener("click", closePermissionDialog);
  permissionFields.scope.addEventListener("change", updatePermissionScopeState);
  document.querySelector("#closeMediaViewerButton").addEventListener("click", closeMediaViewer);
  document.querySelector("#prevMediaButton").addEventListener("click", () => stepMediaViewer(-1));
  document.querySelector("#nextMediaButton").addEventListener("click", () => stepMediaViewer(1));
  document.addEventListener("keydown", (event) => {
    if (!els.mediaViewerDialog?.open) return;
    if (event.key === "ArrowLeft") stepMediaViewer(-1);
    if (event.key === "ArrowRight") stepMediaViewer(1);
    if (event.key === "Escape") closeMediaViewer();
  });
  document.querySelectorAll("[data-summary-view]").forEach((button) => {
    button.addEventListener("click", () => applySummaryView(button.dataset.summaryView));
  });
  document.querySelector("#addAgentButton").addEventListener("click", openAgentDialog);
  document.querySelector("#closeAgentDialogButton").addEventListener("click", closeAgentDialog);
  document.querySelector("#cancelAgentButton").addEventListener("click", closeAgentDialog);
  document.querySelector("#addGuestButton").addEventListener("click", openGuestDialog);
  document.querySelector("#closeGuestDialogButton").addEventListener("click", closeGuestDialog);
  document.querySelector("#cancelGuestButton").addEventListener("click", closeGuestDialog);
  document.querySelector("#closeContractDialogButton").addEventListener("click", closeContractDialog);
  document.querySelector("#cancelContractButton").addEventListener("click", closeContractDialog);

  Object.values(filters).forEach((input) => {
    input.addEventListener("input", render);
    input.addEventListener("change", render);
  });
  Object.values(contractFilters).forEach((input) => {
    input.addEventListener("input", renderContracts);
    input.addEventListener("change", renderContracts);
  });
  document.addEventListener("input", handleFilterEvent, true);
  document.addEventListener("change", handleFilterEvent, true);

  els.taskList.addEventListener("click", (event) => {
    const subtaskCard = event.target.closest(".subtask-list-card");
    if (subtaskCard) {
      selectedId = subtaskCard.dataset.taskId;
      const parent = tasks.find((item) => item.id === selectedId);
      const subtask = parent?.subtasks?.find((item) => item.id === subtaskCard.dataset.subtaskId);
      if (parent && subtask) renderSubtaskView(parent, subtask);
      return;
    }

    const card = event.target.closest(".task-card");
    if (!card) return;
    selectedId = card.dataset.id;
    selectedSummaryView = "";
    highlightedFromGallery = { taskId: "", subtaskId: "" };
    render();
  });

  els.galleryGrid.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-action='open-gallery-media']");
    if (openButton) {
      openMediaViewer(lastGalleryMediaItems, openButton.dataset.mediaId);
      return;
    }

    const card = event.target.closest("[data-action='go-gallery-task'], .gallery-card");
    if (!card) return;
    selectedId = card.dataset.taskId;
    highlightedFromGallery = {
      taskId: card.dataset.taskId || "",
      subtaskId: card.dataset.subtaskId || ""
    };
    selectedSummaryView = "";
    filters.status.value = "all";
    filters.sort.value = "reminderAsc";
    closeGallery();
    render();
  });

  els.alarmList.addEventListener("click", (event) => {
    const card = event.target.closest(".alarm-card");
    if (!card) return;
    selectedId = card.dataset.taskId;
    closeAlarms();
    render();
    document.querySelector("#detailPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.agentList.addEventListener("click", (event) => {
    selectedSummaryView = "";
    const editButton = event.target.closest("[data-action='edit-agent']");
    if (editButton) {
      const agent = agentDirectory.find((item) => item.id === editButton.dataset.agentId);
      if (agent) openAgentDialog(agent);
      return;
    }

    const badge = event.target.closest("[data-agent-badge-filter]");
    if (badge) {
      selectedAgentName = badge.dataset.agentName;
      selectedAgentFilter = badge.dataset.agentBadgeFilter;
      renderAgentDetail();
      return;
    }

    const card = event.target.closest("[data-agent-name]");
    if (!card) return;
    selectedAgentName = card.dataset.agentName;
    selectedAgentFilter = "pending";
    renderAgentDetail();
  });

  els.guestList.addEventListener("click", (event) => {
    selectedSummaryView = "";
    const editButton = event.target.closest("[data-action='edit-guest']");
    if (editButton) {
      const guest = guestDirectory.find((item) => item.id === editButton.dataset.guestId);
      if (guest) openGuestDialog(guest);
      return;
    }

    const badge = event.target.closest("[data-guest-badge-filter]");
    if (badge) {
      selectedGuestName = badge.dataset.guestName;
      selectedGuestFilter = badge.dataset.guestBadgeFilter;
      renderGuestDetail();
      return;
    }

    const card = event.target.closest("[data-guest-name]");
    if (!card) return;
    selectedGuestName = card.dataset.guestName;
    selectedGuestFilter = "active";
    renderGuestDetail();
  });

  els.contractList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-contract-jump]");
    if (!button) return;
    selectedId = button.dataset.taskId;
    selectedSummaryView = "";
    highlightedFromGallery = {
      taskId: button.dataset.taskId || "",
      subtaskId: button.dataset.subtaskId || ""
    };
    const task = tasks.find((item) => item.id === button.dataset.taskId);
    const subtask = button.dataset.subtaskId
      ? (task?.subtasks || []).find((item) => item.id === button.dataset.subtaskId)
      : null;
    if (task && subtask) renderSubtaskView(task, subtask);
    else if (task) renderDetail();
    document.querySelector("#detailPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  els.invitationList.addEventListener("click", async (event) => {
    const acceptButton = event.target.closest("[data-action='accept-invitation']");
    if (!acceptButton) return;
    await acceptIncomingInvitation(acceptButton.dataset.invitationId);
  });

  els.detailPanel.addEventListener("click", (event) => {
    if (event.target.closest("[data-guest-filter]")) {
      selectedGuestFilter = event.target.closest("[data-guest-filter]").dataset.guestFilter;
      renderGuestDetail();
      return;
    }

    if (event.target.closest("[data-agent-filter]")) {
      selectedAgentFilter = event.target.closest("[data-agent-filter]").dataset.agentFilter;
      renderAgentDetail();
      return;
    }

    if (event.target.closest("[data-action='archive-subtask']")) {
      const button = event.target.closest("[data-action='archive-subtask']");
      archiveAgentSubtask(button.dataset.taskId, button.dataset.subtaskId);
      renderAgentDetail();
      return;
    }

    if (event.target.closest("[data-action='accept-agent-subtask']")) {
      const button = event.target.closest("[data-action='accept-agent-subtask']");
      if (button.dataset.taskId) {
        markAgentSubtaskAccepted(button.dataset.taskId, button.dataset.subtaskId);
        renderAgentDetail();
        return;
      }
    }

    if (event.target.closest("[data-action='summary-open-subtask']")) {
      const button = event.target.closest("[data-action='summary-open-subtask']");
      selectedId = button.dataset.taskId;
      selectedSummaryView = "";
      const parent = tasks.find((item) => item.id === selectedId);
      const subtask = parent?.subtasks?.find((item) => item.id === button.dataset.subtaskId);
      if (parent && subtask) renderSubtaskView(parent, subtask);
      return;
    }

    const task = tasks.find((item) => item.id === selectedId);
    if (!task) return;
    const forbiddenAgentAction = event.target.closest([
      "[data-action='edit']",
      "[data-action='edit-subtask']",
      "[data-action='new-subtask']",
      "[data-action='duplicate']",
      "[data-action='share']",
      "[data-action='share-subtask']",
      "[data-action='grant-guest']",
      "[data-action='grant-guest-subtask']",
      "[data-action='add-contract']",
      "[data-action='add-subtask-contract']",
      "[data-action='toggle']",
      "[data-action='pause']",
      "[data-action='reopen']",
      "[data-action='delete']",
      "[data-action='send-guest']",
      "[data-action='accept-guest']",
      "[data-action='suspend-guest']",
      "[data-action='delete-guest-permission']"
    ].join(","));
    if (isReceivedExternalTask(task) && forbiddenAgentAction) {
      if (isReceivedAgentTask(task)) renderAgentExecutionView(task);
      else renderViewerReadOnlyView(task);
      return;
    }

    if (event.target.closest("[data-action='view-task']")) renderTaskView(task);
    if (event.target.closest("[data-action='edit']")) openDialog(task);
    if (event.target.closest("[data-action='new-subtask']")) openSubtaskDialog(task);
    if (event.target.closest("[data-action='view-subtask']")) {
      const button = event.target.closest("[data-action='view-subtask']");
      const subtask = task.subtasks?.find((item) => item.id === button.dataset.subtaskId);
      if (subtask) renderSubtaskView(task, subtask);
    }
    if (event.target.closest("[data-action='edit-subtask']")) {
      const button = event.target.closest("[data-action='edit-subtask']");
      const subtask = task.subtasks?.find((item) => item.id === button.dataset.subtaskId);
      if (subtask) openSubtaskDialog(task, subtask);
    }
    if (event.target.closest("[data-action='open-media-viewer']")) {
      const button = event.target.closest("[data-action='open-media-viewer']");
      openMediaViewer(getMediaItemsForScope(task, button.dataset.scope, button.dataset.subtaskId || ""), button.dataset.mediaId);
      return;
    }
    if (event.target.closest("[data-action='review-media-link']")) {
      const link = event.target.closest("[data-action='review-media-link']");
      markMediaReviewed(link.dataset.mediaId);
      setTimeout(render, 0);
      return;
    }
    if (event.target.closest("[data-action='open-file']")) {
      const link = event.target.closest("[data-action='open-file']");
      markFileReviewed(task, link.dataset.fileId, link.dataset.scope, link.dataset.subtaskId || "");
      setTimeout(render, 0);
      return;
    }
    if (event.target.closest("[data-action='delete-media']")) {
      const button = event.target.closest("[data-action='delete-media']");
      if (isReceivedAgentTask(task)) return;
      deleteStoredMedia(task, button.dataset.mediaId, button.dataset.scope, button.dataset.subtaskId || "");
    }
    if (event.target.closest("[data-action='delete-file']")) {
      const button = event.target.closest("[data-action='delete-file']");
      if (isReceivedAgentTask(task)) return;
      deleteStoredFile(task, button.dataset.fileId, button.dataset.scope, button.dataset.subtaskId || "");
    }
    if (event.target.closest("[data-action='toggle']")) toggleDone(task);
    if (event.target.closest("[data-action='pause']")) updateStatus(task, "paused");
    if (event.target.closest("[data-action='reopen']")) updateStatus(task, "active");
    if (event.target.closest("[data-action='duplicate']")) duplicateTask(task);
    if (event.target.closest("[data-action='share']")) shareTask(task);
    if (event.target.closest("[data-action='accept-task-agent']")) markTaskAgentAccepted(task);
    if (event.target.closest("[data-action='grant-guest']")) openPermissionDialog(task);
    if (event.target.closest("[data-action='add-contract']")) openContractDialog(task);
    if (event.target.closest("[data-action='add-subtask-contract']")) {
      const button = event.target.closest("[data-action='add-subtask-contract']");
      const subtask = task.subtasks?.find((item) => item.id === button.dataset.subtaskId);
      if (subtask) openContractDialog(task, subtask);
    }
    if (event.target.closest("[data-contract-action]")) {
      const button = event.target.closest("[data-contract-action]");
      handleContractAction(task, button);
      return;
    }
    if (event.target.closest("[data-action='send-guest']")) {
      const button = event.target.closest("[data-action='send-guest']");
      shareGuestPermission(task, button.dataset.permissionId);
    }
    if (event.target.closest("[data-action='accept-guest']")) {
      const button = event.target.closest("[data-action='accept-guest']");
      updateGuestPermission(task, button.dataset.permissionId, "accepted");
    }
    if (event.target.closest("[data-action='suspend-guest']")) {
      const button = event.target.closest("[data-action='suspend-guest']");
      updateGuestPermission(task, button.dataset.permissionId, "suspended");
    }
    if (event.target.closest("[data-action='delete-guest-permission']")) {
      const button = event.target.closest("[data-action='delete-guest-permission']");
      deleteGuestPermission(task, button.dataset.permissionId);
    }
    if (event.target.closest("[data-action='share-subtask']")) {
      const button = event.target.closest("[data-action='share-subtask']");
      const subtask = task.subtasks?.find((item) => item.id === button.dataset.subtaskId);
      if (subtask) shareSubtask(task, subtask);
    }
    if (event.target.closest("[data-action='grant-guest-subtask']")) {
      const button = event.target.closest("[data-action='grant-guest-subtask']");
      const subtask = task.subtasks?.find((item) => item.id === button.dataset.subtaskId);
      if (subtask) openPermissionDialog(task, subtask);
    }
    if (event.target.closest("[data-action='accept-agent-subtask']")) {
      const button = event.target.closest("[data-action='accept-agent-subtask']");
      markAgentSubtaskAccepted(task.id, button.dataset.subtaskId);
      renderSubtaskView(task, task.subtasks?.find((item) => item.id === button.dataset.subtaskId));
      return;
    }
    if (event.target.closest("[data-action='delete']")) deleteTask(task);
  });

  els.detailPanel.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-action='agent-message-form']");
    if (!form) return;
    event.preventDefault();
    await saveAgentUpdate(form);
  });

  els.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const task = await buildEntryFromForm();
      if (!task) return;

      if (dialogMode === "subtask") {
        saveSubtaskFromDialog(task);
        closeDialog();
        render();
        return;
      }

      if (editingId) {
        tasks = tasks.map((item) => item.id === editingId ? mergeEditedTask(item, task) : item);
        selectedId = editingId;
        const edited = tasks.find((item) => item.id === editingId);
        if (edited) ensureViewerPermissions(edited, "task");
      } else {
        ensureViewerPermissions(task, "task");
        tasks.unshift(task);
        selectedId = task.id;
        trackEvent("tasksCreated");
      }

      saveTasks();
      closeDialog();
      render();
    } catch (error) {
      console.error("No se pudo guardar la tarea.", error);
      showAttachmentStatus(`No se pudo guardar. ${error?.message || "Revisa los campos y vuelve a intentarlo."}`, true);
    }
  });

  els.form.addEventListener("invalid", (event) => {
    const label = event.target.closest("label")?.childNodes?.[0]?.textContent?.trim() || "campo obligatorio";
    showAttachmentStatus(`Revisa el campo: ${label}.`, true);
  }, true);

  els.configForm.addEventListener("submit", (event) => {
    event.preventDefault();
    userSettings = {
      ownerPhone: configFields.ownerPhone.value.trim(),
      storagePreference: configFields.storagePreference.value,
      autoWhatsapp: configFields.autoWhatsapp.checked
    };
    saveUserSettings();
    closeConfigDialog();
    render();
  });

  els.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuthForm();
  });

  els.agentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = agentFields.name.value.trim();
    if (!name) return;

    const existing = editingAgentId
      ? agentDirectory.find((agent) => agent.id === editingAgentId)
      : agentDirectory.find((agent) => agent.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      const previousName = existing.name;
      existing.phone = agentFields.phone.value.trim();
      existing.email = agentFields.email.value.trim();
      existing.name = name;
      existing.updatedAt = new Date().toISOString();
      if (previousName !== name) updateAgentReferences(previousName, name);
    } else {
      agentDirectory.push({
        id: createId(),
        name,
        phone: agentFields.phone.value.trim(),
        email: agentFields.email.value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    saveAgents();
    refreshAgentSelectOptions(name);
    closeAgentDialog();
    render();
  });

  els.guestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = guestFields.name.value.trim();
    if (!name) return;

    const existing = editingGuestId
      ? guestDirectory.find((guest) => guest.id === editingGuestId)
      : guestDirectory.find((guest) => guest.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      const previousName = existing.name;
      existing.phone = guestFields.phone.value.trim();
      existing.email = guestFields.email.value.trim();
      existing.name = name;
      existing.updatedAt = new Date().toISOString();
      if (previousName !== name) updateGuestReferences(existing.id, previousName, name);
    } else {
      guestDirectory.push({
        id: createId(),
        name,
        phone: guestFields.phone.value.trim(),
        email: guestFields.email.value.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    saveGuests();
    refreshViewerSelectOptions(name);
    closeGuestDialog();
    render();
  });

  els.permissionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePermissionFromDialog();
  });

  els.contractForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveContractFromDialog();
  });
}

function handleFilterEvent(event) {
  if (Object.values(filters).includes(event.target)) {
    render();
  }
}

function render() {
  normalizeReceivedExternalTasks();
  lastFilterSignature = getFilterSignature();
  renderMetrics();
  renderTopBadges();
  renderAgents();
  renderGuests();
  renderContracts();
  if (isSubtaskSummaryView(selectedSummaryView)) {
    renderSubtaskList(getFilteredSubtaskAssignments(selectedSummaryView));
  } else {
    const visible = getVisibleTasks();
    renderTaskList(visible);
  }
  renderDetail();
  renderChart();
  if (galleryOpen) renderGallery();
  if (alarmsOpen) renderAlarms();
}

function normalizeReceivedExternalTasks() {
  let changed = false;
  tasks.forEach((task) => {
    const historyText = (task.history || []).map((item) => item.text || "").join(" ").toLowerCase();
    const importedAsAgent = (
      historyText.includes("tarea incorporada desde enlace compartido") ||
      historyText.includes("subtarea incorporada desde invitacion")
    ) && !isReceivedViewerTask(task);
    if (importedAsAgent && !task.sharedRole && !task.receivedRole) {
      task.receivedRole = "agent";
      task.updatedAt = task.updatedAt || new Date().toISOString();
      changed = true;
    }
    if (String(task.title || "").toLowerCase().startsWith("vista invitado:") && task.sharedRole !== "viewer") {
      task.receivedRole = "viewer";
      changed = true;
    }
  });
  if (changed) persistAgendaLocally();
}

function renderTopBadges() {
  const alarmsBadge = document.querySelector("#alarmsBadge");
  const photosBadge = document.querySelector("#photosBadge");
  if (alarmsBadge) alarmsBadge.textContent = getAlarmItems().length;
  if (photosBadge) {
    const lastViewed = localStorage.getItem(LAST_GALLERY_VIEW_KEY) || "";
    const newMedia = getAllMediaItems().filter((item) => !lastViewed || item.addedAt > lastViewed).length;
    photosBadge.textContent = newMedia;
  }
  const inboxBadge = document.querySelector("#inboxBadge");
  if (inboxBadge) inboxBadge.textContent = incomingInvitations.filter((item) => item.status !== "accepted" && item.status !== "declined").length;
}

function getAllMediaItems() {
  return tasks.flatMap((task) => [
    ...(task.photos || []).map((photo) => ({ ...photo, taskId: task.id, taskTitle: task.title, scope: "task" })),
    ...(task.subtasks || []).flatMap((subtask) => (subtask.photos || []).map((photo) => ({
      ...photo,
      taskId: task.id,
      taskTitle: task.title,
      subtaskId: subtask.id,
      subtaskTitle: subtask.title,
      scope: "subtask"
    })))
  ]);
}

function getMediaItemsForScope(task, scope, subtaskId) {
  if (scope === "subtask") {
    const subtask = (task.subtasks || []).find((item) => item.id === subtaskId);
    return (subtask?.photos || []).map((media) => ({
      ...media,
      taskId: task.id,
      taskTitle: task.title,
      subtaskId: subtask.id,
      subtaskTitle: subtask.title,
      scope: "subtask"
    }));
  }

  return (task.photos || []).map((media) => ({
    ...media,
    taskId: task.id,
    taskTitle: task.title,
    scope: "task"
  }));
}

function applySummaryView(viewName) {
  if (["all", "pending", "done", "overdue", "workorders"].includes(viewName)) {
    selectedSummaryView = "";
    applyMetricFilter(viewName);
    return;
  }

  selectedSummaryView = viewName;
  galleryOpen = false;
  alarmsOpen = false;
  els.galleryPanel.classList.add("hidden");
  els.alarmsPanel.classList.add("hidden");
  els.taskList.classList.remove("hidden");
  if (isSubtaskSummaryView(viewName)) {
    filters.status.value = "all";
    filters.search.value = "";
  }
  render();
}

function isSubtaskSummaryView(viewName) {
  return ["subtasks", "subtasks-pending", "subtasks-done", "subtasks-overdue"].includes(viewName);
}

function openGallery() {
  galleryOpen = true;
  alarmsOpen = false;
  trackEvent("galleryOpens");
  els.galleryPanel.classList.remove("hidden");
  els.alarmsPanel.classList.add("hidden");
  els.taskList.classList.add("hidden");
  filters.search.value = "";
  filters.status.value = "all";
  render();
  localStorage.setItem(LAST_GALLERY_VIEW_KEY, new Date().toISOString());
  renderTopBadges();
}

function closeGallery() {
  galleryOpen = false;
  els.galleryPanel.classList.add("hidden");
  els.taskList.classList.remove("hidden");
}

function openAlarms() {
  alarmsOpen = true;
  galleryOpen = false;
  selectedSummaryView = "";
  els.alarmsPanel.classList.remove("hidden");
  els.galleryPanel.classList.add("hidden");
  els.taskList.classList.add("hidden");
  renderAlarms();
}

function closeAlarms() {
  alarmsOpen = false;
  els.alarmsPanel.classList.add("hidden");
  els.taskList.classList.remove("hidden");
}

function renderAlarms() {
  const alarms = getAlarmItems();
  els.alarmList.innerHTML = "";

  if (!alarms.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No hay alarmas en los proximos 10 dias.";
    els.alarmList.append(empty);
    return;
  }

  alarms.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `alarm-card ${item.isOverdue ? "overdue" : ""}`;
    button.dataset.taskId = item.taskId;
    button.innerHTML = `
      <div class="alarm-date">${formatDate(item.date)}</div>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.kind)} · ${escapeHtml(item.meta)}</span>
      </div>
    `;
    els.alarmList.append(button);
  });
}

function getAlarmItems() {
  const today = todayKey();
  const limit = addDays(10);

  const alarms = tasks.flatMap((task) => {
    const items = [];
    const taskDate = getAlarmDateKey(task.reminder || task.dueDate);
    if (task.status !== "done" && taskDate && taskDate >= today && taskDate <= limit) {
      items.push({
        taskId: task.id,
        date: taskDate,
        title: task.title,
        kind: task.reminder ? "Recordatorio de tarea" : "Fecha prevista de tarea",
        meta: `${task.category} · ${task.priority}`,
        isOverdue: taskDate < today
      });
    }

    (task.subtasks || []).forEach((subtask) => {
      const subtaskDate = getAlarmDateKey(subtask.reminder || task.reminder || task.dueDate);
      if (subtask.status !== "done" && subtask.status !== "archived" && subtaskDate && subtaskDate >= today && subtaskDate <= limit) {
        items.push({
          taskId: task.id,
          date: subtaskDate,
          title: subtask.title,
          kind: "Subtarea",
          meta: `${subtask.agent} · ${task.title}`,
          isOverdue: subtaskDate < today
        });
      }
    });

    return items;
  }).sort((a, b) => a.date.localeCompare(b.date));

  if (alarms.length) return alarms;

  return tasks
    .filter((task) => task.status !== "done" && task.status !== "archived" && task.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 10)
    .map((task) => ({
      taskId: task.id,
      date: task.dueDate,
      title: task.title,
      kind: "Proxima tarea pendiente",
      meta: `${task.category} · ${task.priority}`,
      isOverdue: task.dueDate < todayKey()
    }));
}

function getAlarmDateKey(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function renderGallery() {
  const term = els.photoSearch.value.trim().toLowerCase();
  const photos = getAllMediaItems()
    .map((photo) => {
      const task = tasks.find((item) => item.id === photo.taskId);
      return {
        ...photo,
        category: task?.category || "",
        keywords: (task?.keywords || []).join(" "),
        subtaskText: `${photo.subtaskTitle || ""} ${(task?.subtasks || []).map((subtask) => `${subtask.title} ${subtask.agent || ""}`).join(" ")}`
      };
    })
    .filter((photo) => {
      const text = `${photo.taskTitle} ${photo.subtaskText} ${photo.category} ${photo.keywords} ${photo.gps}`.toLowerCase();
      return text.includes(term);
    })
    .sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""));

  lastGalleryMediaItems = photos;
  els.galleryGrid.innerHTML = "";

  if (!photos.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No hay fotos, videos o audios con esos criterios.";
    els.galleryGrid.append(empty);
    return;
  }

  photos.forEach((photo) => {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.dataset.taskId = photo.taskId;
    card.dataset.subtaskId = photo.subtaskId || "";
    card.innerHTML = `
      <button class="media-preview-button" data-action="open-gallery-media" data-media-id="${photo.id}" type="button" aria-label="Ver evidencia a pantalla completa">
        ${renderMediaPreview(photo, photo.taskTitle, false)}
      </button>
      <div>
        <strong>${escapeHtml(photo.subtaskTitle || photo.taskTitle)}</strong>
        <span>${photo.subtaskTitle ? `Tarea: ${escapeHtml(photo.taskTitle)}` : "Tarea principal"}</span>
        <span>${formatDateTime(photo.addedAt)}</span>
        <span>${getMediaSourceShortLabel(photo)} - ${escapeHtml(photo.gps || "GPS no indicado")}</span>
      </div>
      <div class="gallery-actions">
        <button class="small-button" data-action="open-gallery-media" data-media-id="${photo.id}" type="button">Ver grande</button>
        <button class="small-button" data-action="go-gallery-task" data-task-id="${photo.taskId}" data-subtask-id="${photo.subtaskId || ""}" type="button">Ir a tarea</button>
      </div>
    `;
    els.galleryGrid.append(card);
  });
}

function openShareInfo() {
  document.querySelector("#shareInfoDialog").showModal();
}

function closeShareInfo() {
  document.querySelector("#shareInfoDialog").close();
}

function getAppShareMessage() {
  const url = getAppBaseUrl();
  return `Te invito a probar TRACKION AGENDA.\n\nEs una agenda profesional para PC y movil que permite organizar tareas, asignar subtareas a agentes, invitar visualizadores, controlar avances, fotos, GPS, incidencias y evidencias.\n\nPuedes abrirla en plataforma web y, cuando este activa la nube, usarla sincronizada en PC y movil.\n\nEnlace: ${url}`;
}

function shareAppByWhatsapp() {
  trackEvent("appWhatsappShares");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(getAppShareMessage())}`;
  window.open(whatsappUrl, "_blank", "noopener");
}

function shareAppBySms() {
  trackEvent("appSmsShares");
  const separator = /iPad|iPhone|iPod/i.test(navigator.userAgent) ? "&" : "?";
  window.location.href = `sms:${separator}body=${encodeURIComponent(getAppShareMessage())}`;
}

async function shareAppByEmail() {
  trackEvent("appEmailShares");
  const subject = "Invitacion a TRACKION AGENDA";
  const body = getAppShareMessage();
  const endpoint = window.AGENDA_CONFIG?.inviteEmailEndpoint;
  const shareStatus = document.querySelector("#shareStatus");

  if (!endpoint) {
    shareStatus.textContent = "Email por servidor aun no configurado. Abro el correo del dispositivo como alternativa.";
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return;
  }

  try {
    shareStatus.textContent = "Enviando email desde servidor...";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, appUrl: getAppBaseUrl() })
    });

    if (!response.ok) throw new Error("Error enviando email");
    shareStatus.textContent = "Email enviado desde TRACKION.";
  } catch {
    shareStatus.textContent = "No se pudo enviar desde servidor. Abro el correo del dispositivo como alternativa.";
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}

function openOwnerStats() {
  renderOwnerStats();
  document.querySelector("#ownerStatsDialog").showModal();
}

function closeOwnerStats() {
  document.querySelector("#ownerStatsDialog").close();
}

function renderOwnerStats() {
  const photos = tasks.reduce((total, task) => total + (task.photos?.length || 0), 0);
  const files = tasks.reduce((total, task) => total + (task.files?.length || 0) + (task.subtasks || []).reduce((sum, subtask) => sum + (subtask.files?.length || 0), 0), 0);
  const subtasks = tasks.reduce((total, task) => total + (task.subtasks?.length || 0), 0);
  const guestPermissions = tasks.reduce((total, task) => total + (task.guestPermissions?.length || 0), 0);
  const acceptedPermissions = tasks.reduce((total, task) => total + (task.guestPermissions || []).filter((permission) => permission.status === "accepted").length, 0);
  const metrics = [
    ["Aperturas locales", analytics.opens],
    ["Tareas locales", tasks.length],
    ["Tareas creadas", analytics.tasksCreated],
    ["Agentes", agentDirectory.length],
    ["Invitados", guestDirectory.length],
    ["Permisos invitados", guestPermissions],
    ["Permisos aceptados", acceptedPermissions],
    ["Subtareas", subtasks],
    ["Fotos", photos],
    ["Archivos", files],
    ["Avisos 48/24h", getWhatsappReminderItems().length],
    ["Galeria abierta", analytics.galleryOpens],
    ["WhatsApp app", analytics.appWhatsappShares],
    ["SMS app", analytics.appSmsShares],
    ["Email app", analytics.appEmailShares],
    ["WhatsApp tareas", analytics.taskWhatsappShares],
    ["WhatsApp subtareas", analytics.subtaskWhatsappShares],
    ["WhatsApp invitados", analytics.guestWhatsappShares]
  ];
  document.querySelector("#ownerMetrics").innerHTML = metrics.map(([label, value]) => `
    <article>
      <strong>${value || 0}</strong>
      <span>${label}</span>
    </article>
  `).join("");
}

function watchFilterValues() {
  setInterval(() => {
    const signature = getFilterSignature();
    if (signature !== lastFilterSignature) {
      render();
    }
  }, 250);
}

function getFilterSignature() {
  return JSON.stringify({
    search: filters.search.value,
    status: filters.status.value,
    type: filters.type.value,
    category: filters.category.value,
    media: filters.media.value,
    sort: filters.sort.value
  });
}

function renderAgents() {
  els.agentList.innerHTML = "";

  if (!agentDirectory.length) {
    const empty = document.createElement("p");
    empty.className = "task-meta";
    empty.textContent = "Sin agentes creados.";
    els.agentList.append(empty);
    return;
  }

  agentDirectory.forEach((agent) => {
    const counts = getAgentCounts(agent.name);
    const node = document.createElement("article");
    node.className = "agent-chip";
    node.dataset.agentName = agent.name;
    node.innerHTML = `
      <div class="agent-name-line">
        <strong>${escapeHtml(agent.name)}</strong>
        <button class="small-button inline-edit-button" data-action="edit-agent" data-agent-id="${agent.id}" type="button">Editar</button>
        <span class="agent-badges" aria-label="Resumen de subtareas">
          <button class="agent-badge pending" data-agent-name="${escapeHtml(agent.name)}" data-agent-badge-filter="pending" type="button" title="Pendientes o en proceso">${counts.pending}</button>
          <button class="agent-badge done" data-agent-name="${escapeHtml(agent.name)}" data-agent-badge-filter="done" type="button" title="Terminadas">${counts.done}</button>
          <button class="agent-badge archived" data-agent-name="${escapeHtml(agent.name)}" data-agent-badge-filter="archived" type="button" title="Guardadas">${counts.archived}</button>
        </span>
      </div>
      <span>${escapeHtml(agent.phone || "Sin WhatsApp")}</span>
      <span>${escapeHtml(agent.email || "Sin email")}</span>
    `;
    els.agentList.append(node);
  });
}

function getAgentCounts(agentName) {
  return getAgentAssignments(agentName).reduce((counts, item) => {
    if (item.subtask.status === "done") counts.done += 1;
    else if (item.subtask.status === "archived") counts.archived += 1;
    else counts.pending += 1;
    return counts;
  }, { pending: 0, done: 0, archived: 0 });
}

function renderAgentDetail() {
  const assigned = getAgentAssignments(selectedAgentName);
  const pending = assigned.filter((item) => item.subtask.status !== "done" && item.subtask.status !== "archived");
  const done = assigned.filter((item) => item.subtask.status === "done");
  const archived = assigned.filter((item) => item.subtask.status === "archived");
  const visible = selectedAgentFilter === "done" ? done : selectedAgentFilter === "archived" ? archived : pending;

  els.detailPanel.innerHTML = `
    <section class="detail-head">
      <p class="eyebrow">Agente</p>
      <h2>${escapeHtml(selectedAgentName)}</h2>
      <div class="detail-actions">
        <button class="small-button ${selectedAgentFilter === "pending" ? "active" : ""}" data-agent-filter="pending" type="button">Pendientes (${pending.length})</button>
        <button class="small-button ${selectedAgentFilter === "done" ? "active" : ""}" data-agent-filter="done" type="button">Terminadas (${done.length})</button>
        <button class="small-button ${selectedAgentFilter === "archived" ? "active" : ""}" data-agent-filter="archived" type="button">Guardadas (${archived.length})</button>
      </div>
    </section>
    <section class="section-block">
      <h3>${agentFilterTitle(selectedAgentFilter)}</h3>
      ${visible.length ? visible.map((item) => renderAgentAssignmentCard(item)).join("") : "<p class=\"task-meta\">No hay subtareas en este apartado.</p>"}
    </section>
  `;
}

function renderAgentAssignment(item) {
  const canArchive = item.subtask.status === "done";
  return `
    <article class="subtask-row ${item.subtask.status}">
      <div>
        <strong>${escapeHtml(item.subtask.title)}</strong>
        <p class="task-meta">Tarea: ${escapeHtml(item.task.title)} · ${statusLabels[item.subtask.status] || item.subtask.status} · Entrada ${escapeHtml(item.subtask.checkIn || "sin registrar")} · Salida ${escapeHtml(item.subtask.checkOut || "sin registrar")}</p>
      </div>
      <div class="subtask-actions">
        <div class="subtask-progress">
          <span>${item.subtask.progress}/10</span>
          <div class="progress-mini"><span style="width:${item.subtask.progress * 10}%"></span></div>
        </div>
        <button class="small-button" data-task-id="${item.task.id}" data-subtask-id="${item.subtask.id}" data-action="archive-subtask" type="button" ${canArchive ? "" : "disabled"}>Guardar</button>
      </div>
    </article>
  `;
}

function renderAgentAssignmentCard(item) {
  const dueDate = item.subtask.dueDate || item.task.dueDate || "";
  return `
    <article class="subtask-row ${item.subtask.status || "new"}">
      <div>
        <strong>${escapeHtml(item.subtask.title || item.task.title)}</strong>
        <p class="task-meta">Tarea: ${escapeHtml(item.task.title)} - ${statusLabels[item.subtask.status] || item.subtask.status || "Nueva"} - ${agentInviteStatusLabel(item.subtask)} - Alta ${formatDate(item.subtask.createdAt || item.task.createdAt)} - Prevista ${dueDate ? formatDate(dueDate) : "sin fecha"} - ${formatDaysUntil(dueDate)}</p>
      </div>
      <div class="subtask-actions">
        <div class="subtask-progress">
          <span>${Number(item.subtask.progress || 0)}/10</span>
          <div class="progress-mini"><span style="width:${Number(item.subtask.progress || 0) * 10}%"></span></div>
        </div>
        <button class="small-button" data-task-id="${item.task.id}" data-subtask-id="${item.subtask.id}" data-action="summary-open-subtask" type="button">Abrir</button>
        <button class="small-button" data-task-id="${item.task.id}" data-subtask-id="${item.subtask.id}" data-action="accept-agent-subtask" type="button">Marcar aceptada</button>
      </div>
    </article>
  `;
}

function getAgentAssignments(agentName) {
  return tasks.flatMap((task) => (task.subtasks || [])
    .filter((subtask) => subtask.agent === agentName || (subtask.agents || []).includes(agentName))
    .map((subtask) => ({ task, subtask })));
}

function archiveAgentSubtask(taskId, subtaskId) {
  const task = tasks.find((item) => item.id === taskId);
  const subtask = task?.subtasks?.find((item) => item.id === subtaskId);
  if (!subtask || subtask.status !== "done") return;
  subtask.status = "archived";
  task.updatedAt = new Date().toISOString();
  saveTasks();
}

function agentFilterTitle(filter) {
  if (filter === "done") return "Subtareas terminadas";
  if (filter === "archived") return "Subtareas guardadas";
  return "Subtareas pendientes";
}

function renderGuests() {
  els.guestList.innerHTML = "";

  if (!guestDirectory.length) {
    const empty = document.createElement("p");
    empty.className = "task-meta";
    empty.textContent = "Sin invitados creados.";
    els.guestList.append(empty);
    return;
  }

  guestDirectory.forEach((guest) => {
    const counts = getGuestCounts(guest.id);
    const node = document.createElement("article");
    node.className = "agent-chip";
    node.dataset.guestName = guest.name;
    node.innerHTML = `
      <div class="agent-name-line">
        <strong>${escapeHtml(guest.name)}</strong>
        <button class="small-button inline-edit-button" data-action="edit-guest" data-guest-id="${guest.id}" type="button">Editar</button>
        <span class="agent-badges" aria-label="Resumen de visualizaciones">
          <button class="agent-badge active-view" data-guest-name="${escapeHtml(guest.name)}" data-guest-badge-filter="active" type="button" title="Puede ver">${counts.active}</button>
          <button class="agent-badge removed-view" data-guest-name="${escapeHtml(guest.name)}" data-guest-badge-filter="removed" type="button" title="Ya no puede ver">${counts.removed}</button>
        </span>
      </div>
      <span>${escapeHtml(guest.phone || "Sin WhatsApp")}</span>
      <span>${counts.active} activas · ${counts.removed} retiradas</span>
      <span>Ultima conexion: ${formatLastSeen(getGuestLastSeen(guest.id, guest.name))}</span>
    `;
    els.guestList.append(node);
  });
}

function renderContracts() {
  refreshContractAgentFilter();
  const rows = getFilteredContracts();
  els.contractCount.textContent = rows.length;
  els.contractList.innerHTML = "";

  if (!rows.length) {
    const empty = document.createElement("p");
    empty.className = "task-meta";
    empty.textContent = "Sin contratos con estos filtros.";
    els.contractList.append(empty);
    return;
  }

  rows.slice(0, 18).forEach((item) => {
    const button = document.createElement("button");
    button.className = `contract-mini-card ${item.contract.status || "draft"}`;
    button.type = "button";
    button.dataset.contractJump = item.contract.id;
    button.dataset.taskId = item.task.id;
    button.dataset.subtaskId = item.subtask?.id || "";
    button.innerHTML = `
      <span class="contract-mini-title">${escapeHtml(item.contract.title || `Contrato v${item.contract.version || 1}`)}</span>
      <span>${escapeHtml(item.contract.recipient || "Sin agente")} - ${contractStatusLabels[item.contract.status || "draft"] || item.contract.status}</span>
      <span>${item.subtask ? `Subtarea: ${escapeHtml(item.subtask.title || item.task.title)}` : `Tarea: ${escapeHtml(item.task.title)}`}</span>
      <span>v${Number(item.contract.version || 1)} - ${formatDateTime(item.contract.updatedAt || item.contract.createdAt)}</span>
    `;
    els.contractList.append(button);
  });

  if (rows.length > 18) {
    const more = document.createElement("p");
    more.className = "task-meta";
    more.textContent = `+${rows.length - 18} contrato(s) mas. Afina la busqueda para verlos.`;
    els.contractList.append(more);
  }
}

function refreshContractAgentFilter() {
  const current = contractFilters.agent.value || "all";
  const agents = [...new Set(getAllContracts().map((item) => item.contract.recipient).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  contractFilters.agent.innerHTML = "";
  contractFilters.agent.append(new Option("Todos", "all"));
  agents.forEach((agent) => contractFilters.agent.append(new Option(agent, agent)));
  contractFilters.agent.value = agents.includes(current) ? current : "all";
}

function getAllContracts() {
  return tasks.flatMap((task) => [
    ...(task.contracts || []).map((contract) => ({ task, subtask: null, contract })),
    ...(task.subtasks || []).flatMap((subtask) => (subtask.contracts || []).map((contract) => ({ task, subtask, contract })))
  ]);
}

function getFilteredContracts() {
  const term = (contractFilters.search.value || "").trim().toLowerCase();
  const agent = contractFilters.agent.value || "all";
  const status = contractFilters.status.value || "all";
  return getAllContracts()
    .filter((item) => {
      if (agent !== "all" && item.contract.recipient !== agent) return false;
      if (status !== "all" && item.contract.status !== status) return false;
      if (!term) return true;
      const text = [
        item.contract.title,
        item.contract.recipient,
        item.contract.file?.name,
        item.task.title,
        item.subtask?.title,
        item.contract.note,
        contractStatusLabels[item.contract.status || "draft"]
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(term);
    })
    .sort(sortContractRows);
}

function sortContractRows(a, b) {
  const mode = contractFilters.sort.value || "updatedDesc";
  if (mode === "updatedAsc") return getContractDate(a).localeCompare(getContractDate(b));
  if (mode === "agentAsc") return (a.contract.recipient || "").localeCompare(b.contract.recipient || "");
  if (mode === "statusAsc") return (a.contract.status || "draft").localeCompare(b.contract.status || "draft");
  if (mode === "versionDesc") return Number(b.contract.version || 0) - Number(a.contract.version || 0);
  return getContractDate(b).localeCompare(getContractDate(a));
}

function getContractDate(item) {
  return item.contract.updatedAt || item.contract.createdAt || "";
}

function renderGuestDetail() {
  const guest = guestDirectory.find((item) => item.name === selectedGuestName);
  const assignments = getGuestAssignments(guest?.id || "", selectedGuestName);
  const active = assignments.filter((item) => item.permission.status !== "suspended");
  const removed = assignments.filter((item) => item.permission.status === "suspended");
  const visible = selectedGuestFilter === "removed" ? removed : active;

  els.detailPanel.innerHTML = `
    <section class="detail-head">
      <p class="eyebrow">Invitado</p>
      <h2>${escapeHtml(selectedGuestName)}</h2>
      <div class="detail-actions">
        <button class="small-button ${selectedGuestFilter === "active" ? "active" : ""}" data-guest-filter="active" type="button">Puede ver (${active.length})</button>
        <button class="small-button ${selectedGuestFilter === "removed" ? "active" : ""}" data-guest-filter="removed" type="button">Ya no puede ver (${removed.length})</button>
      </div>
    </section>
    <section class="section-block">
      <h3>${selectedGuestFilter === "removed" ? "Permisos retirados" : "Permisos activos"}</h3>
      ${visible.length ? visible.map(renderGuestAssignmentCard).join("") : "<p class=\"task-meta\">No hay tareas en este apartado.</p>"}
    </section>
  `;
}

function renderGuestAssignment(item) {
  const scopeText = item.permission.scope === "task" ? "Tarea completa" : `Subtarea: ${item.permission.subtaskTitle}`;
  return `
    <article class="permission-row">
      <div>
        <strong>${escapeHtml(item.task.title)}</strong>
        <p class="task-meta">${escapeHtml(scopeText)} · ${permissionStatusLabel(item.permission.status)}</p>
        <span class="permission-status ${item.permission.status}">${permissionStatusLabel(item.permission.status)}</span>
      </div>
      <div class="permission-actions">
        <button class="small-button" data-action="send-guest" data-permission-id="${item.permission.id}" type="button">WhatsApp</button>
      </div>
    </article>
  `;
}

function renderGuestAssignmentCard(item) {
  const scopeText = item.permission.scope === "task" ? "Tarea completa" : `Subtarea: ${item.permission.subtaskTitle || "sin titulo"}`;
  const subtask = item.permission.subtaskId
    ? (item.task.subtasks || []).find((entry) => entry.id === item.permission.subtaskId)
    : null;
  const dueDate = subtask?.dueDate || item.task.dueDate || "";
  return `
    <article class="permission-row">
      <div>
        <strong>${escapeHtml(item.task.title)}</strong>
        <p class="task-meta">${escapeHtml(scopeText)} - Prevista ${dueDate ? formatDate(dueDate) : "sin fecha"} - ${formatDaysUntil(dueDate)} - Ultima visita: ${formatLastSeen(item.permission.lastViewedAt || item.permission.acceptedAt)}</p>
        <span class="permission-status ${item.permission.status}">${permissionStatusLabel(item.permission.status)}</span>
      </div>
    </article>
  `;
}

function getGuestAssignments(guestId, guestName) {
  return tasks.flatMap((task) => (task.guestPermissions || [])
    .filter((permission) => permission.guestId === guestId || permission.guestName === guestName)
    .map((permission) => ({ task, permission })));
}

function getGuestCounts(guestId) {
  return getGuestAssignments(guestId, "").reduce((counts, item) => {
    if (item.permission.status === "suspended") counts.removed += 1;
    else counts.active += 1;
    return counts;
  }, { active: 0, removed: 0 });
}

function getGuestLastSeen(guestId, guestName) {
  return getGuestAssignments(guestId, guestName)
    .map((item) => item.permission.lastViewedAt || item.permission.acceptedAt || "")
    .filter(Boolean)
    .sort()
    .pop() || "";
}

function renderMetrics() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;
  const pending = tasks.filter((task) => task.status !== "done").length;
  const overdue = tasks.filter(isOverdue).length;
  const workorders = tasks.filter(isReceivedAgentTask).length;
  const allSubtasks = getAllSubtaskAssignments();
  const subtasks = allSubtasks.length;
  const subtasksDone = allSubtasks.filter((item) => item.subtask.status === "done" || item.subtask.status === "archived").length;
  const subtasksPending = allSubtasks.filter((item) => item.subtask.status !== "done" && item.subtask.status !== "archived").length;
  const subtasksOverdue = allSubtasks.filter((item) => isSubtaskOverdue(item.task, item.subtask)).length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const subtaskProgress = subtasks ? Math.round((subtasksDone / subtasks) * 100) : 0;

  document.querySelector("#metricTotal").textContent = total;
  document.querySelector("#metricPending").textContent = pending;
  document.querySelector("#metricDone").textContent = done;
  document.querySelector("#metricOverdue").textContent = overdue;
  document.querySelector("#metricWorkorders").textContent = workorders;
  document.querySelector("#metricSubtasks").textContent = subtasks;
  document.querySelector("#metricSubtasksPending").textContent = subtasksPending;
  document.querySelector("#metricSubtasksDone").textContent = subtasksDone;
  document.querySelector("#metricSubtasksOverdue").textContent = subtasksOverdue;
  document.querySelector("#metricSubtasksProgress").textContent = `${subtaskProgress}%`;
  document.querySelector("#metricGuests").textContent = guestDirectory.length;
  document.querySelector("#metricProgress").textContent = `${progress}%`;
  document.querySelectorAll("[data-summary-view]").forEach((button) => {
    const view = button.dataset.summaryView;
    const isFilterActive = !selectedSummaryView && view === filters.status.value;
    button.classList.toggle("active", selectedSummaryView === view || isFilterActive);
  });
}

function applyMetricFilter(filterName) {
  selectedSummaryView = "";
  highlightedFromGallery = { taskId: "", subtaskId: "" };
  filters.status.value = filterName;
  filters.search.value = "";
  render();
}

async function initSync() {
  const syncStatus = document.querySelector("#syncStatus");
  const config = window.AGENDA_CONFIG || { syncMode: "local" };
  cloudStore = await window.AgendaDataStore?.create(config);

  if (!cloudStore || cloudStore.mode === "local") {
    syncStatus.textContent = "Local";
    document.querySelector("#openAuthButton")?.classList.add("hidden");
    document.querySelector("#signOutButton")?.classList.add("hidden");
    return;
  }

  document.querySelector("#openAuthButton")?.classList.remove("hidden");
  syncStatus.textContent = "Sin acceso";
  cloudStore.onAuthStateChanged(async (user) => {
    if (remoteUnsubscribe) {
      remoteUnsubscribe();
      remoteUnsubscribe = null;
    }
    if (incomingInvitationsUnsubscribe) {
      incomingInvitationsUnsubscribe();
      incomingInvitationsUnsubscribe = null;
    }
    if (sentInvitationsUnsubscribe) {
      sentInvitationsUnsubscribe();
      sentInvitationsUnsubscribe = null;
    }
    if (!user) {
      syncStatus.textContent = "Sin acceso";
      document.querySelector("#openAuthButton")?.classList.remove("hidden");
      document.querySelector("#signOutButton")?.classList.add("hidden");
      document.querySelector("#inboxButton")?.classList.add("hidden");
      incomingInvitations = [];
      sentInvitations = [];
      renderTopBadges();
      return;
    }

    document.querySelector("#openAuthButton")?.classList.add("hidden");
    document.querySelector("#signOutButton")?.classList.remove("hidden");
    document.querySelector("#inboxButton")?.classList.remove("hidden");
    syncStatus.textContent = "Sincronizando";
    const remoteAgenda = typeof cloudStore.loadAgenda === "function"
      ? await cloudStore.loadAgenda()
      : { tasks: await cloudStore.load(), agents: [], guests: [], userSettings: {} };
    if (remoteAgenda.tasks?.length) {
      tasks = mergeTasks(tasks, remoteAgenda.tasks);
      selectedId = tasks[0]?.id || selectedId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
    if (remoteAgenda.agents?.length) {
      agentDirectory = mergePeopleDirectory(agentDirectory, remoteAgenda.agents);
      localStorage.setItem(AGENTS_KEY, JSON.stringify(agentDirectory));
    }
    if (remoteAgenda.guests?.length) {
      guestDirectory = mergePeopleDirectory(guestDirectory, remoteAgenda.guests);
      localStorage.setItem(GUESTS_KEY, JSON.stringify(guestDirectory));
    }
    if (remoteAgenda.userSettings && Object.keys(remoteAgenda.userSettings).length) {
      userSettings = { ...userSettings, ...remoteAgenda.userSettings };
      localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(userSettings));
    }
    rebuildDirectoriesFromTasks();
    render();
    await saveAgendaToCloud();
    lastRemoteSignature = JSON.stringify(getAgendaPayload());
    if (typeof cloudStore.subscribeAgenda === "function") {
      remoteUnsubscribe = cloudStore.subscribeAgenda((nextRemoteAgenda) => {
        const nextSignature = JSON.stringify(nextRemoteAgenda);
        if (nextSignature === lastRemoteSignature) return;
        const mergedPayload = {
          tasks: mergeTasks(tasks, nextRemoteAgenda.tasks || []),
          agents: mergePeopleDirectory(agentDirectory, nextRemoteAgenda.agents || []),
          guests: mergePeopleDirectory(guestDirectory, nextRemoteAgenda.guests || []),
          userSettings: { ...userSettings, ...(nextRemoteAgenda.userSettings || {}) }
        };
        const mergedSignature = JSON.stringify(mergedPayload);
        if (mergedSignature === JSON.stringify(getAgendaPayload())) {
          lastRemoteSignature = nextSignature;
          return;
        }
        tasks = mergedPayload.tasks;
        agentDirectory = mergedPayload.agents;
        guestDirectory = mergedPayload.guests;
        userSettings = mergedPayload.userSettings;
        rebuildDirectoriesFromTasks();
        lastRemoteSignature = mergedSignature;
        persistAgendaLocally();
        if (!tasks.some((item) => item.id === selectedId)) selectedId = tasks[0]?.id || null;
        render();
      });
    } else if (typeof cloudStore.subscribe === "function") {
      remoteUnsubscribe = cloudStore.subscribe((nextRemoteTasks) => {
        const nextSignature = JSON.stringify(nextRemoteTasks);
        if (nextSignature === lastRemoteSignature) return;
        const merged = mergeTasks(tasks, nextRemoteTasks);
        const mergedSignature = JSON.stringify(merged);
        if (mergedSignature === JSON.stringify(tasks)) {
          lastRemoteSignature = nextSignature;
          return;
        }
        tasks = merged;
        rebuildDirectoriesFromTasks();
        lastRemoteSignature = mergedSignature;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        if (!tasks.some((item) => item.id === selectedId)) selectedId = tasks[0]?.id || null;
        render();
      });
    }
    if (typeof cloudStore.subscribeInvitations === "function") {
      incomingInvitationsUnsubscribe = cloudStore.subscribeInvitations((items) => {
        incomingInvitations = items
          .filter((item) => item.status !== "declined")
          .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
        applyIncomingInvitationUpdates();
        renderTopBadges();
        if (els.inboxDialog?.open) renderInboxDialog();
      });
    }
    if (typeof cloudStore.subscribeSentInvitations === "function") {
      sentInvitationsUnsubscribe = cloudStore.subscribeSentInvitations((items) => {
        sentInvitations = items;
        applySentInvitationStatuses();
      });
    }
    syncStatus.textContent = user.email || "Nube";
    closeAuthDialog();
  });
}

function renderTaskList(visible) {
  els.resultTitle.textContent = filters.status.options[filters.status.selectedIndex].textContent;
  els.resultCount.textContent = `${visible.length} resultados`;
  els.taskList.innerHTML = "";

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No hay tareas con estos criterios.";
    els.taskList.append(empty);
    return;
  }

  visible.forEach((task) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;
    node.classList.toggle("selected", task.id === selectedId);
    node.classList.toggle("highlighted", task.id === highlightedFromGallery.taskId);
    node.classList.toggle("needs-review", hasUnreadUploads(task));
    node.classList.toggle("work-order-card", isReceivedAgentTask(task));
    node.classList.toggle("viewer-order-card", isReceivedViewerTask(task));
    node.classList.toggle("agent-needs-attention", hasAgentWorkOrderAlert(task));
    node.querySelector("h3").textContent = task.title;
    node.querySelector(".task-meta").textContent = buildTaskMeta(task);

    const dot = node.querySelector(".status-dot");
    dot.classList.add(task.status);
    dot.classList.toggle("work-order-marker", isReceivedAgentTask(task));
    dot.classList.toggle("viewer-order-marker", isReceivedViewerTask(task));
    dot.setAttribute("aria-label", statusLabels[task.status]);

    const priority = node.querySelector(".priority-pill");
    priority.textContent = task.priority;
    priority.classList.add(task.priority);
    priority.insertAdjacentHTML("beforebegin", renderPeopleSignal(task, null));

    const tagRow = node.querySelector(".tag-row");
    const mediaCount = getTaskMediaCount(task);
    const fileCount = getTaskFileCount(task);
    const subtaskCount = task.subtasks?.length || 0;
    [...(task.keywords || []), task.category, typeLabels[task.type], `${subtaskCount} subt.`, `${mediaCount} media`, `${fileCount} arch.`].slice(0, 7).forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tag;
      tagRow.append(chip);
    });
    if (hasUnreadUploads(task)) tagRow.insertAdjacentHTML("beforeend", `<span class="review-alert-pill">${getUnreadEvidenceCount(task)} sin revisar</span>`);
    if (hasAgentWorkOrderAlert(task)) tagRow.insertAdjacentHTML("beforeend", "<span class=\"review-alert-pill\">orden con novedad</span>");

    const preview = renderTaskCardSubtasks(task);
    if (preview) node.querySelector(".task-card-body").insertAdjacentHTML("beforeend", preview);

    node.querySelector(".progress-mini span").style.width = `${task.progress * 10}%`;
    if (isReceivedAgentTask(task) || isReceivedViewerTask(task)) {
      node.querySelector(".progress-mini").insertAdjacentHTML("afterend", `<p class="task-received-date">Fecha: ${escapeHtml(formatReceivedDate(task))}</p>`);
    }
    els.taskList.append(node);
  });
}

function renderSubtaskList(rows) {
  const titles = {
    subtasks: "Todas las subtareas",
    "subtasks-pending": "Subtareas pendientes",
    "subtasks-done": "Subtareas terminadas",
    "subtasks-overdue": "Subtareas vencidas"
  };
  els.resultTitle.textContent = titles[selectedSummaryView] || "Subtareas";
  els.resultCount.textContent = `${rows.length} resultados`;
  els.taskList.innerHTML = "";

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No hay subtareas con este criterio.";
    els.taskList.append(empty);
    return;
  }

  rows.forEach(({ task, subtask }) => {
    const node = document.createElement("article");
    const agent = subtask.agent || (subtask.agents || [])[0] || "Sin agente";
    const dueDate = subtask.dueDate || task.dueDate || "";
    const visibleCount = getSubtaskPermissions(task, subtask.id).filter((permission) => permission.status !== "suspended").length;
    node.className = `task-card subtask-list-card ${hasUnreadSubtaskUploads(subtask) ? "needs-review" : ""} ${isReceivedAgentTask(task) ? "work-order-card" : ""} ${isReceivedViewerTask(task) ? "viewer-order-card" : ""}`;
    node.dataset.taskId = task.id;
    node.dataset.subtaskId = subtask.id;
    node.innerHTML = `
      <span class="subtask-marker ${isReceivedAgentTask(task) ? "work-order-subtask-marker" : ""} ${isReceivedViewerTask(task) ? "viewer-order-subtask-marker" : ""}" aria-hidden="true"></span>
      <div class="task-card-body">
        <div class="task-line">
          <h3>${escapeHtml(subtask.title || task.title)}</h3>
          <span class="people-signal-wrap">${renderPeopleSignal(task, subtask)}</span>
          <span class="priority-pill ${subtask.priority || task.priority || "media"}">${escapeHtml(subtask.priority || task.priority || "media")}</span>
        </div>
        <p class="task-meta">Tarea: ${escapeHtml(task.title)} - Agente: ${escapeHtml(agent)} - ${agentInviteStatusLabel(subtask)} - Alta ${formatDate(subtask.createdAt || task.createdAt)} - Prevista ${formatDate(dueDate)} - ${formatDaysUntil(dueDate)}</p>
        <div class="tag-row">
          <span class="tag">${statusLabels[subtask.status] || subtask.status || "Nueva"}</span>
          <span class="assignment-status ${subtask.agentInviteStatus || "pending"}">${agentInviteStatusLabel(subtask)}</span>
          ${renderPeopleSignal(task, subtask)}
          ${renderEvidenceCounters(subtask.photos || [], subtask.files || [], subtask.agentNotes || [], { always: true })}
        </div>
      </div>
      <div class="subtask-progress">
        <span>${Number(subtask.progress || 0)}/10</span>
        <div class="progress-mini"><span style="width:${Number(subtask.progress || 0) * 10}%"></span></div>
      </div>
    `;
    els.taskList.append(node);
  });
}

function renderTaskCardSubtasks(task) {
  const subtasks = (task.subtasks || []).slice(0, 4);
  if (!subtasks.length) return "";

  const rows = subtasks.map((subtask) => {
    const visibleCount = getSubtaskPermissions(task, subtask.id).filter((permission) => permission.status !== "suspended").length;
    const agent = subtask.agent || (subtask.agents || [])[0] || "Sin agente";
    return `
      <div class="task-subtask-preview ${hasUnreadSubtaskUploads(subtask) ? "needs-review" : ""} ${highlightedFromGallery.subtaskId === subtask.id ? "highlighted" : ""} ${isReceivedAgentTask(task) ? "work-order-preview" : ""} ${isReceivedViewerTask(task) ? "viewer-order-preview" : ""}">
        <span class="subtask-marker ${isReceivedAgentTask(task) ? "work-order-subtask-marker" : ""} ${isReceivedViewerTask(task) ? "viewer-order-subtask-marker" : ""}" aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(subtask.title || task.title)}</strong>
          <span>${escapeHtml(agent)} - ${agentInviteStatusLabel(subtask)} - ${formatDaysUntil(subtask.dueDate || task.dueDate)}</span>
          <div class="media-strip">
            <span class="evidence-token visibility-token" title="Visualizadores activos"><strong>VIS:</strong> ${visibleCount}</span>
            ${renderEvidenceCounters(subtask.photos || [], subtask.files || [], subtask.agentNotes || [], { always: true })}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const more = (task.subtasks || []).length > subtasks.length
    ? `<span class="task-meta">+${(task.subtasks || []).length - subtasks.length} subtarea(s) mas</span>`
    : "";
  return `<div class="task-subtasks-preview">${rows}${more}</div>`;
}

function renderDetail() {
  if (selectedSummaryView && !isSubtaskSummaryView(selectedSummaryView)) {
    renderSummaryDetail(selectedSummaryView);
    return;
  }

  const task = tasks.find((item) => item.id === selectedId);
  if (!task) {
    els.detailPanel.innerHTML = "<div class=\"empty-detail\"><h2>Selecciona una tarea</h2><p>Veras detalle, agentes, evidencias, mensajes y progreso.</p></div>";
    return;
  }

  task.photos = task.photos || [];
  task.files = task.files || [];
  task.subtasks = task.subtasks || [];
  task.guestPermissions = task.guestPermissions || [];

  if (isReceivedAgentTask(task)) {
    renderAgentExecutionView(task);
    return;
  }
  if (isReceivedViewerTask(task)) {
    renderViewerReadOnlyView(task);
    return;
  }

  const photos = renderMediaGrid(task, task.photos, "task", "");
  const files = renderFileList(task.files, "task", "");

  const agents = task.agents.length ? task.agents.map((agent) => `
    <article class="agent-row">
      <strong>${escapeHtml(agent)}</strong>
      <span class="task-meta">Puede registrar texto, voz, fotos, entrada/salida, incidencias y avance.</span>
    </article>
  `).join("") : "<p class=\"task-meta\">Sin agentes asignados.</p>";

  const subtasks = task.subtasks?.length ? task.subtasks.map((subtask) => `
    <article class="subtask-row ${subtask.status}">
      <div>
        <strong>${escapeHtml(subtask.title)}</strong>
        <p class="task-meta">${escapeHtml(subtask.agent)} · ${statusLabels[subtask.status] || subtask.status} · Entrada ${escapeHtml(subtask.checkIn || "sin registrar")} · Salida ${escapeHtml(subtask.checkOut || "sin registrar")}</p>
      </div>
      <div class="subtask-actions">
        <div class="subtask-progress">
          <span>${subtask.progress}/10</span>
          <div class="progress-mini"><span style="width:${subtask.progress * 10}%"></span></div>
        </div>
        <button class="small-button" data-action="share-subtask" data-subtask-id="${subtask.id}" type="button">Enviar</button>
        <button class="small-button" data-action="grant-guest-subtask" data-subtask-id="${subtask.id}" type="button">Invitar visor</button>
      </div>
    </article>
  `).join("") : "<p class=\"task-meta\">Sin subtareas asignadas.</p>";

  const richSubtasks = task.subtasks.length
    ? task.subtasks.map((subtask) => renderSubtaskRow(task, subtask)).join("")
    : "<p class=\"task-meta\">Sin subtareas asignadas.</p>";

  const permissions = task.guestPermissions?.length ? task.guestPermissions.map((permission) => {
    const guest = guestDirectory.find((item) => item.id === permission.guestId);
    const scopeText = permission.scope === "task" ? "Tarea completa" : `Subtarea: ${escapeHtml(permission.subtaskTitle || "")}`;
    const acceptedText = permission.acceptedAt ? ` · Aceptado ${formatDateTime(permission.acceptedAt)}` : "";
    return `
      <article class="permission-row">
        <div>
          <strong>${escapeHtml(guest?.name || permission.guestName || "Invitado")}</strong>
          <p class="task-meta">${scopeText}${acceptedText}</p>
          <span class="permission-status ${permission.status}">${permissionStatusLabel(permission.status)}</span>
        </div>
        <div class="permission-actions">
          <button class="small-button" data-action="send-guest" data-permission-id="${permission.id}" type="button">WhatsApp</button>
          <button class="small-button" data-action="accept-guest" data-permission-id="${permission.id}" type="button">Simular acepta</button>
          <button class="small-button danger-button" data-action="suspend-guest" data-permission-id="${permission.id}" type="button">Suspender</button>
          <button class="small-button danger-button" data-action="delete-guest-permission" data-permission-id="${permission.id}" type="button">Eliminar</button>
        </div>
      </article>
    `;
  }).join("") : "<p class=\"task-meta\">Sin invitados con permisos.</p>";
  const richPermissions = renderTaskPermissionRows(task);

  els.detailPanel.innerHTML = `
    <section class="detail-head">
      <p class="eyebrow">${typeLabels[task.type]} · ${statusLabels[task.status]}</p>
      <h2>${escapeHtml(task.title)}</h2>
      ${task.status === "paused" ? "<div class=\"pause-warning\">NO CONTINUAR TRABAJANDO EN ESTA TAREA. Se permiten evidencias e incidencias.</div>" : ""}
      <div class="detail-actions">
        <button class="small-button" data-action="view-task" type="button">Ver contenido</button>
        <button class="small-button" data-action="edit" type="button">Editar</button>
        <button class="small-button" data-action="new-subtask" type="button">Nueva subtarea</button>
        <button class="small-button" data-action="duplicate" type="button">Duplicar</button>
        <button class="small-button" data-action="share" type="button">WhatsApp</button>
        ${renderTaskAgentAcceptedButton(task)}
        <button class="small-button" data-action="${task.status === "done" ? "reopen" : "toggle"}" type="button">${task.status === "done" ? "Reabrir" : "Concluir"}</button>
        <button class="small-button danger-button" data-action="pause" type="button">Pausa</button>
        <button class="small-button danger-button" data-action="delete" type="button">Borrar</button>
      </div>
    </section>

    <section class="info-grid">
      <article><span>Alta</span><strong>${formatDateTime(task.createdAt)}</strong></article>
      <article><span>Prevista</span><strong>${task.dueDate ? formatDate(task.dueDate) : "Sin fecha"}</strong></article>
      <article><span>Prioridad</span><strong>${task.priority}</strong></article>
      <article><span>Avance</span><strong>${task.progress}/10</strong></article>
      <article><span>Categoria</span><strong>${task.category}</strong></article>
      <article><span>Recordatorio</span><strong>${task.reminder ? formatDateTime(task.reminder) : "No definido"}</strong></article>
    </section>

    <section class="section-block">
      <h3>Descripcion</h3>
      <p class="task-meta">${escapeHtml(task.description || "Sin descripcion.")}</p>
    </section>

    <section class="section-block">
      <h3>Palabras clave</h3>
      <div class="tag-row">${task.keywords.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("") || "<span class=\"task-meta\">Sin tags.</span>"}</div>
    </section>

    <section class="section-block">
      <h3>Agentes</h3>
      ${agents}
    </section>

    <section class="section-block">
      <div class="panel-title">
        <h3>Subtareas por agente</h3>
        <button class="small-button" data-action="new-subtask" type="button">Nueva subtarea</button>
      </div>
      ${richSubtasks}
    </section>

    <section class="section-block">
      <h3>Visualizadores</h3>
      <p class="task-meta">${task.viewers.map(escapeHtml).join(", ") || "Sin visualizadores."}</p>
    </section>

    <section class="section-block">
      <div class="panel-title">
        <h3>Invitados y permisos</h3>
        <button class="small-button" data-action="grant-guest" type="button">Dar permiso</button>
      </div>
      ${richPermissions}
    </section>

    <section class="section-block">
      <h3>Galerias y archivos</h3>
      ${renderEvidenceLibrary(task, task.photos || [], task.files || [], "task", "")}
    </section>

    <section class="section-block">
      <div class="panel-title">
        <h3>Contratacion</h3>
        <button class="small-button" data-action="add-contract" type="button">Nuevo contrato</button>
      </div>
      ${renderContractingSection(task)}
    </section>
  `;
}

function renderTaskView(task) {
  if (isReceivedAgentTask(task)) {
    renderAgentExecutionView(task);
    return;
  }
  if (isReceivedViewerTask(task)) {
    renderViewerReadOnlyView(task);
    return;
  }
  task.photos = task.photos || [];
  task.files = task.files || [];
  task.subtasks = task.subtasks || [];
  task.guestPermissions = task.guestPermissions || [];
  if (markTaskTextReviewed(task)) {
    task.updatedAt = new Date().toISOString();
    saveTasks();
  }
  const viewCount = (task.guestPermissions || [])
    .filter((permission) => permission.scope === "task")
    .reduce((total, permission) => total + Number(permission.viewCount || 0), 0);

  els.detailPanel.innerHTML = `
    <section class="detail-head view-detail-head">
      <p class="eyebrow">Ver tarea</p>
      <h2>${escapeHtml(task.title)}</h2>
      <div class="detail-actions">
        <button class="small-button" data-action="edit" type="button">Editar</button>
        <button class="small-button" data-action="new-subtask" type="button">Nueva subtarea</button>
        <button class="small-button" data-action="share" type="button">WhatsApp</button>
        ${renderTaskAgentAcceptedButton(task)}
        <button class="small-button" data-action="grant-guest" type="button">Dar permiso</button>
      </div>
    </section>

    <section class="info-grid">
      <article><span>Estado</span><strong>${statusLabels[task.status] || task.status}</strong></article>
      <article><span>Avance</span><strong>${Number(task.progress || 0)}/10</strong></article>
      <article><span>Alta</span><strong>${formatDateTime(task.createdAt)}</strong></article>
      <article><span>Prevista</span><strong>${task.dueDate ? formatDate(task.dueDate) : "Sin fecha"}</strong></article>
      <article><span>Recordatorio</span><strong>${task.reminder ? formatDateTime(task.reminder) : "No definido"}</strong></article>
      <article><span>Vistas invitados</span><strong>${viewCount}</strong></article>
    </section>

    <section class="section-block">
      <h3>Descripcion / instrucciones</h3>
      <p class="task-meta">${escapeHtml(task.description || "Sin descripcion.")}</p>
    </section>

    <section class="section-block">
      <div class="panel-title">
        <h3>Subtareas</h3>
        <button class="small-button" data-action="new-subtask" type="button">Nueva subtarea</button>
      </div>
      ${task.subtasks.length ? task.subtasks.map((subtask) => renderSubtaskRow(task, subtask)).join("") : "<p class=\"task-meta\">Sin subtareas asignadas.</p>"}
    </section>

    <section class="section-block">
      <h3>Invitados y visualizaciones</h3>
      ${renderTaskPermissionRows(task)}
    </section>

    <section class="section-block">
      <h3>Galerias y archivos</h3>
      ${renderEvidenceLibrary(task, task.photos || [], task.files || [], "task", "")}
    </section>

    <section class="section-block">
      <div class="panel-title">
        <h3>Contratacion</h3>
        <button class="small-button" data-action="add-contract" type="button">Nuevo contrato</button>
      </div>
      ${renderContractingSection(task)}
    </section>
  `;
}

function renderTaskPermissionRows(task) {
  if (!task.guestPermissions?.length) return "<p class=\"task-meta\">Sin invitados con permisos.</p>";

  return task.guestPermissions.map((permission) => {
    const guest = guestDirectory.find((item) => item.id === permission.guestId);
    const name = guest?.name || permission.guestName || "Invitado";
    const scopeText = permission.scope === "task" ? "Tarea completa" : `Subtarea: ${permission.subtaskTitle || "sin titulo"}`;
    const dateText = permission.acceptedAt
      ? `Aceptado ${formatDateTime(permission.acceptedAt)}`
      : permission.sentAt
        ? `Enviado ${formatDateTime(permission.sentAt)}`
      : permission.suspendedAt
        ? `Pausado ${formatDateTime(permission.suspendedAt)}`
        : `Alta ${formatDateTime(permission.createdAt)}`;
    const lastSeenText = `Ultima visita: ${formatLastSeen(permission.lastViewedAt || permission.acceptedAt)}`;
    return `
      <article class="permission-row">
        <div>
          <strong>${escapeHtml(name)}</strong>
          <p class="task-meta">${escapeHtml(scopeText)} - ${dateText} - ${lastSeenText}</p>
          <span class="permission-status ${permission.status}">${permissionStatusLabel(permission.status)}</span>
        </div>
        <div class="permission-actions">
          <button class="small-button" data-action="send-guest" data-permission-id="${permission.id}" type="button">Enviar enlace</button>
          <button class="small-button" data-action="accept-guest" data-permission-id="${permission.id}" type="button">Puede ver</button>
          <button class="small-button danger-button" data-action="suspend-guest" data-permission-id="${permission.id}" type="button">Pausar</button>
          <button class="small-button danger-button" data-action="delete-guest-permission" data-permission-id="${permission.id}" type="button">Eliminar</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderContractingSection(task, subtask = null) {
  const contracts = getContractList(task, subtask);
  if (!contracts.length) {
    return `
      <div class="contract-empty">
        <strong>Modulo preparado / firma pendiente de proveedor</strong>
        <p class="task-meta">Aqui se gestionaran contratos por versiones. La firma certificada se activara cuando conectemos Docusign, Signaturit, Adobe Sign u otro proveedor eIDAS/API.</p>
      </div>
    `;
  }

  return `
    <div class="contract-list">
      ${contracts
        .slice()
        .sort((a, b) => Number(b.version || 0) - Number(a.version || 0))
        .map((contract) => renderContractCard(task, subtask, contract))
        .join("")}
    </div>
  `;
}

function renderContractCard(task, subtask, contract) {
  const scope = subtask ? "subtask" : "task";
  const subtaskId = subtask?.id || "";
  const status = contract.status || "draft";
  const canDelete = canDeleteContract(contract);
  const signed = status === "signed";
  const fileName = contract.file?.name || "Contrato sin archivo";
  const signedName = buildSignedContractFileName(task, subtask, contract);
  return `
    <article class="contract-card ${status}">
      <div class="contract-card-main">
        <div class="contract-title-line">
          <strong>${escapeHtml(contract.title || `Contrato v${contract.version || 1}`)}</strong>
          <span class="contract-status ${status}">${contractStatusLabels[status] || status}</span>
        </div>
        <p class="task-meta">v${Number(contract.version || 1)} - Firmante: ${escapeHtml(contract.recipient || "Sin agente")} - Archivo: ${escapeHtml(fileName)}</p>
        <p class="task-meta">${formatContractTimeline(contract)}</p>
        ${contract.note ? `<p class="task-meta">Nota: ${escapeHtml(contract.note)}</p>` : ""}
        ${renderContractAudit(contract)}
        ${signed
          ? `<div class="contract-certified">FIRMADO CERTIFICADO - ${escapeHtml(signedName)}</div>`
          : `<div class="contract-pending-provider">Firma certificada pendiente de proveedor. Flujo preparado, no activo legalmente.</div>`}
      </div>
      <div class="contract-actions">
        ${contract.file?.dataUrl ? `<a class="small-button" href="${contract.file.dataUrl}" target="_blank" rel="noopener">Abrir</a>` : ""}
        ${contract.file?.dataUrl ? `<a class="small-button" href="${contract.file.dataUrl}" download="${escapeHtml(fileName)}">Descargar</a>` : ""}
        ${signed && contract.signedFile?.dataUrl ? `<a class="small-button" href="${contract.signedFile.dataUrl}" download="${escapeHtml(signedName)}">Descargar firmado</a>` : ""}
        ${signed && !contract.signedFile?.dataUrl ? `<button class="small-button" type="button" disabled>Firmado sin PDF API</button>` : ""}
        ${status === "draft" || status === "unlocked" ? `<button class="small-button" data-contract-action="send" data-contract-id="${contract.id}" data-contract-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Enviar</button>` : ""}
        ${status === "sent" ? `<button class="small-button" data-contract-action="open" data-contract-id="${contract.id}" data-contract-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Marcar abierto</button>` : ""}
        ${status === "opened" ? `<button class="small-button" data-contract-action="request-unlock" data-contract-id="${contract.id}" data-contract-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Solicitar desbloqueo</button>` : ""}
        ${status === "change_requested" ? `<button class="small-button" data-contract-action="unlock" data-contract-id="${contract.id}" data-contract-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Desbloquear</button>` : ""}
        <button class="small-button" type="button" disabled>Firmar proveedor</button>
        ${canDelete ? `<button class="small-button danger-button" data-contract-action="delete" data-contract-id="${contract.id}" data-contract-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Borrar</button>` : ""}
      </div>
    </article>
  `;
}

function renderContractAudit(contract) {
  const audit = (contract.audit || []).slice(-4);
  if (!audit.length) return "";
  return `
    <ul class="contract-audit">
      ${audit.map((item) => `<li>${formatDateTime(item.at)} - ${escapeHtml(item.text || "")}</li>`).join("")}
    </ul>
  `;
}

function getContractList(task, subtask = null) {
  if (subtask) {
    subtask.contracts = subtask.contracts || [];
    return subtask.contracts;
  }
  task.contracts = task.contracts || [];
  return task.contracts;
}

function canDeleteContract(contract) {
  return ["draft", "sent", "unlocked", "cancelled"].includes(contract?.status || "draft") && !contract.openedAt && !contract.signedAt
    || (contract?.status === "unlocked" && !contract.signedAt);
}

function formatContractTimeline(contract) {
  const parts = [`Alta ${formatDateTime(contract.createdAt)}`];
  if (contract.sentAt) parts.push(`Enviado ${formatDateTime(contract.sentAt)}`);
  if (contract.openedAt) parts.push(`Abierto ${formatDateTime(contract.openedAt)}`);
  if (contract.unlockRequestedAt) parts.push(`Desbloqueo solicitado ${formatDateTime(contract.unlockRequestedAt)}`);
  if (contract.unlockedAt) parts.push(`Desbloqueado ${formatDateTime(contract.unlockedAt)}`);
  if (contract.signedAt) parts.push(`Firmado ${formatDateTime(contract.signedAt)}`);
  return parts.join(" - ");
}

function buildSignedContractFileName(task, subtask, contract) {
  const base = [contract.title, subtask?.title || task.title, contract.recipient]
    .filter(Boolean)
    .join("_")
    .replace(/[^a-z0-9_-]+/gi, "_")
    .replace(/_+/g, "_")
    .slice(0, 90);
  const date = (contract.signedAt || new Date().toISOString()).slice(0, 10);
  return `${base || "Contrato"}_v${contract.version || 1}_FIRMADO_CERTIFICADO_${date}.pdf`;
}

function renderAgentExecutionView(task, activeSubtask = null) {
  const assignedSubtasks = task.subtasks?.length ? task.subtasks : [];
  const targetSubtask = activeSubtask || assignedSubtasks[0] || null;
  const target = targetSubtask || task;
  const instructionUnread = hasUnreadOwnerInstructions(task, targetSubtask);
  const owner = task.sharedOwnerEmail || task.ownerEmail || "Propietario";
  const instructions = targetSubtask
    ? (targetSubtask.description || targetSubtask.instructions || task.description || "")
    : (task.description || "");
  if (instructionUnread) markOwnerInstructionsViewed(task, targetSubtask);

  els.detailPanel.innerHTML = `
    <section class="detail-head agent-execution-head">
      <p class="eyebrow">Tarea recibida como agente</p>
      <h2>${escapeHtml(targetSubtask?.title || task.title)}</h2>
      <p class="task-meta">Puedes informar avances y aportar evidencias. Los datos de propietario no son editables desde tu vista.</p>
      <div class="detail-actions">
        <button class="small-button" data-action="view-task" type="button">Actualizar vista</button>
      </div>
    </section>

    <section class="info-grid">
      <article><span>Tarea</span><strong>${escapeHtml(task.title)}</strong></article>
      <article><span>Prevista</span><strong>${formatDate(targetSubtask?.dueDate || task.dueDate)}</strong></article>
      <article><span>Avance</span><strong>${Number(target.progress || task.progress || 0)}/10</strong></article>
      <article><span>Modo</span><strong>Solo ejecucion</strong></article>
    </section>

    <section class="section-block ${instructionUnread ? "needs-review" : ""}">
      <h3>Descripcion / instrucciones del propietario</h3>
      <p class="task-meta">${escapeHtml(instructions || "Sin instrucciones.")}</p>
    </section>

    ${assignedSubtasks.length > 1 ? `
      <section class="section-block">
        <h3>Subtareas asignadas</h3>
        ${assignedSubtasks.map((subtask) => `
          <article class="subtask-row ${targetSubtask?.id === subtask.id ? "selected" : ""}">
            <div>
              <strong>${escapeHtml(subtask.title || task.title)}</strong>
              <p class="task-meta">${statusLabels[subtask.status] || subtask.status || "Nueva"} - ${formatDaysUntil(subtask.dueDate || task.dueDate)}</p>
            </div>
            <div class="subtask-actions">
              <button class="small-button" data-action="view-subtask" data-subtask-id="${subtask.id}" type="button">Abrir</button>
            </div>
          </article>
        `).join("")}
      </section>
    ` : ""}

    <section class="section-block">
      <h3>Nuevo parte de avance</h3>
      ${renderAgentMessageForm(task, targetSubtask)}
    </section>

    <section class="section-block">
      <h3>Partes enviados</h3>
      ${renderAgentNotes(target)}
    </section>

    <section class="section-block">
      <h3>Fotos, videos, audios y archivos</h3>
      ${renderEvidenceLibrary(task, target.photos || [], target.files || [], targetSubtask ? "subtask" : "task", targetSubtask?.id || "", { readonly: true })}
    </section>
  `;
}

function renderAgentMessageForm(task, subtask = null) {
  const target = subtask || task;
  return `
    <form class="agent-message-form" data-action="agent-message-form" data-task-id="${task.id}" data-subtask-id="${subtask?.id || ""}">
      <label>
        Nuevo mensaje
        <textarea name="agentMessage" rows="4" placeholder="Escribe aqui el avance, incidencia o comentario que debe ver el propietario."></textarea>
      </label>
      <label>
        Avance del trabajo: <strong><span data-agent-progress-value>${Number(target.progress || 0)}</span>/10</strong>
        <input name="agentProgress" type="range" min="0" max="10" step="1" value="${Number(target.progress || 0)}" oninput="this.closest('form').querySelector('[data-agent-progress-value]').textContent=this.value">
      </label>
      <div class="agent-upload-grid">
        <label>
          Modo de carga
          <select name="agentMediaSource">
            <option value="library">Del dispositivo</option>
            <option value="app">Camara foto/video</option>
            <option value="microphone">Microfono / audio</option>
          </select>
        </label>
        <label>
          Fotos, videos o audios
          <input name="agentMedia" type="file" accept="image/*,video/*,audio/*" multiple>
        </label>
        <label>
          Archivos relacionados
          <input name="agentFiles" type="file" multiple>
        </label>
      </div>
      <div class="dialog-actions">
        <button class="primary-button" type="submit">Enviar avance</button>
      </div>
    </form>
  `;
}

function renderViewerReadOnlyView(task) {
  task.photos = task.photos || [];
  task.files = task.files || [];
  task.subtasks = task.subtasks || [];
  const owner = task.sharedOwnerEmail || task.ownerEmail || "Propietario";
  els.detailPanel.innerHTML = `
    <section class="detail-head viewer-readonly-head">
      <p class="eyebrow">Tarea recibida como visualizador</p>
      <h2>${escapeHtml(task.title)}</h2>
      <p class="task-meta">Vista autorizada por ${escapeHtml(owner)}. Puedes consultar, pero no modificar ni reenviar.</p>
    </section>

    <section class="info-grid">
      <article><span>Prevista</span><strong>${formatDate(task.dueDate)}</strong></article>
      <article><span>Avance</span><strong>${Number(task.progress || 0)}/10</strong></article>
      <article><span>Modo</span><strong>Solo visualizacion</strong></article>
    </section>

    <section class="section-block">
      <h3>Descripcion / instrucciones visibles</h3>
      <p class="task-meta">${escapeHtml(task.description || "Sin descripcion.")}</p>
    </section>

    <section class="section-block">
      <h3>Subtareas visibles</h3>
      ${task.subtasks.length ? task.subtasks.map((subtask) => renderViewerSubtaskPreview(task, subtask)).join("") : "<p class=\"task-meta\">Sin subtareas visibles.</p>"}
    </section>

    <section class="section-block">
      <h3>Galerias y archivos</h3>
      ${renderEvidenceLibrary(task, task.photos || [], task.files || [], "task", "", { readonly: true })}
    </section>
  `;
}

function renderViewerSubtaskPreview(task, subtask) {
  return `
    <article class="subtask-row viewer-subtask-row">
      <div>
        <strong>${escapeHtml(subtask.title || task.title)}</strong>
        <p class="task-meta">${statusLabels[subtask.status] || subtask.status || "Nueva"} - ${formatDaysUntil(subtask.dueDate || task.dueDate)}</p>
        ${renderEvidenceCounters(subtask.photos || [], subtask.files || [], subtask.agentNotes || [], { always: true })}
      </div>
    </article>
  `;
}

function renderSubtaskView(task, subtask) {
  if (!subtask) return;
  if (isReceivedAgentTask(task)) {
    renderAgentExecutionView(task, subtask);
    return;
  }
  if (isReceivedViewerTask(task)) {
    renderViewerReadOnlyView(task);
    return;
  }
  if (markSubtaskTextReviewed(subtask)) {
    task.updatedAt = new Date().toISOString();
    subtask.needsReview = hasUnreadSubtaskUploads(subtask);
    saveTasks();
  }
  const dueDate = subtask.dueDate || task.dueDate || "";
  const permissions = getSubtaskVisiblePermissions(task, subtask);
  const viewCount = permissions.reduce((total, item) => total + Number(item.viewCount || 0), 0);
  els.detailPanel.innerHTML = `
    <section class="detail-head">
      <p class="eyebrow">Ver subtarea</p>
      <h2>${escapeHtml(subtask.title || task.title)}</h2>
      <p class="task-meta">Tarea: ${escapeHtml(task.title)}</p>
      <div class="detail-actions">
        <button class="small-button" data-action="edit-subtask" data-subtask-id="${subtask.id}" type="button">Editar</button>
        <button class="small-button" data-action="share-subtask" data-subtask-id="${subtask.id}" type="button">Enviar agente</button>
        <button class="small-button" data-action="accept-agent-subtask" data-subtask-id="${subtask.id}" type="button">Marcar aceptada</button>
        <button class="small-button" data-action="grant-guest-subtask" data-subtask-id="${subtask.id}" type="button">Invitar visor</button>
      </div>
    </section>

    <section class="info-grid">
      <article><span>Agente</span><strong>${escapeHtml(subtask.agent || (subtask.agents || [])[0] || "Sin agente")}</strong></article>
      <article><span>Asignacion</span><strong>${agentInviteStatusLabel(subtask)}</strong></article>
      <article><span>Alta</span><strong>${formatDate(subtask.createdAt || task.createdAt)}</strong></article>
      <article><span>Prevista</span><strong>${formatDate(dueDate)}</strong></article>
      <article><span>Dias</span><strong>${formatDaysUntil(dueDate)}</strong></article>
      <article><span>Avance</span><strong>${Number(subtask.progress || 0)}/10</strong></article>
      <article><span>Vistas invitado</span><strong>${viewCount}</strong></article>
    </section>

    <section class="section-block">
      <h3>Descripcion / instrucciones</h3>
      <p class="task-meta">${escapeHtml(subtask.description || subtask.note || task.description || "Sin descripcion.")}</p>
    </section>

    <section class="section-block">
      <div class="panel-title">
        <h3>Contratacion</h3>
        <button class="small-button" data-action="add-subtask-contract" data-subtask-id="${subtask.id}" type="button">Nuevo contrato</button>
      </div>
      ${renderContractingSection(task, subtask)}
    </section>

    <section class="section-block">
      <h3>Textos del agente</h3>
      ${renderAgentNotes(subtask)}
    </section>

    <section class="section-block">
      <h3>Invitados que pueden ver</h3>
      ${permissions.length ? permissions.map((permission) => `
        <article class="permission-row">
          <div>
            <strong>${escapeHtml(permission.guestName || "Invitado")}</strong>
            <p class="task-meta">${permissionStatusLabel(permission.status)} - ${Number(permission.viewCount || 0)} visualizacion(es) - Ultima visita: ${formatLastSeen(permission.lastViewedAt || permission.acceptedAt)}</p>
          </div>
        </article>
      `).join("") : "<p class=\"task-meta\">Sin invitados con permiso para esta subtarea.</p>"}
    </section>

    <section class="section-block">
      <h3>Galerias y archivos</h3>
      ${renderEvidenceLibrary(task, subtask.photos || [], subtask.files || [], "subtask", subtask.id)}
    </section>
  `;
}

function getSubtaskVisiblePermissions(task, subtask) {
  return (task.guestPermissions || [])
    .filter((permission) => permission.status !== "suspended" && (permission.scope === "task" || permission.subtaskId === subtask.id))
    .map((permission) => {
      const guest = guestDirectory.find((item) => item.id === permission.guestId);
      return { ...permission, guestName: guest?.name || permission.guestName || "Invitado" };
    });
}

function renderAgentNotes(subtask) {
  const notes = subtask.agentNotes || [];
  if (!notes.length) return "<p class=\"task-meta\">Sin textos registrados por agentes.</p>";

  return `
    <div class="agent-note-list">
      ${notes
        .slice()
        .sort((a, b) => (b.addedAt || "").localeCompare(a.addedAt || ""))
        .map((note) => `
          <article class="agent-note ${isUnreadAgentText(note) ? "needs-review" : ""}">
            <p>${escapeHtml(note.text || "")}</p>
            <span>${formatDateTime(note.addedAt)} - ${escapeHtml(note.gps || "GPS no indicado")} - ${escapeHtml(note.agent || "Agente")}</span>
          </article>
        `).join("")}
    </div>
  `;
}

function isReceivedAgentTask(task) {
  if (!task) return false;
  if (task.sharedRole === "agent" || task.receivedRole === "agent") return true;
  if (task.sharedInvitationId && task.sharedRole !== "viewer") return true;
  const currentEmail = normalizeEmail(cloudStore?.getUser?.()?.email || "");
  if (task.sharedOwnerEmail && normalizeEmail(task.sharedOwnerEmail) !== currentEmail && task.sharedRole !== "viewer") return true;
  const historyText = (task.history || []).map((item) => item.text || "").join(" ").toLowerCase();
  return (
    historyText.includes("tarea incorporada desde enlace compartido") ||
    historyText.includes("subtarea incorporada desde invitacion")
  ) && !String(task.title || "").toLowerCase().startsWith("vista invitado:");
}

function isReceivedViewerTask(task) {
  if (!task) return false;
  if (task.sharedRole === "viewer" || task.receivedRole === "viewer") return true;
  return String(task.title || "").toLowerCase().startsWith("vista invitado:");
}

function isReceivedExternalTask(task) {
  return isReceivedAgentTask(task) || isReceivedViewerTask(task);
}

function hasAgentWorkOrderAlert(task) {
  if (!isReceivedAgentTask(task)) return false;
  return Boolean(
    hasUnreadOwnerInstructions(task) ||
    (task.subtasks || []).some((subtask) => hasUnreadOwnerInstructions(task, subtask)) ||
    (task.agentNotes || []).some(isUnreadAgentText) ||
    (task.subtasks || []).some((subtask) => (subtask.agentNotes || []).some(isUnreadAgentText))
  );
}

function hasUnreadOwnerInstructions(task, subtask = null) {
  const target = subtask || task;
  const updatedAt = target.ownerInstructionsUpdatedAt || target.instructionsUpdatedAt || "";
  return Boolean(updatedAt && (!target.agentInstructionsViewedAt || updatedAt > target.agentInstructionsViewedAt));
}

function markOwnerInstructionsViewed(task, subtask = null) {
  const target = subtask || task;
  if (!hasUnreadOwnerInstructions(task, subtask)) return false;
  target.agentInstructionsViewedAt = new Date().toISOString();
  task.updatedAt = new Date().toISOString();
  saveTasks();
  return true;
}

async function saveAgentUpdate(form) {
  const taskId = form.dataset.taskId;
  const subtaskId = form.dataset.subtaskId || "";
  const cleanText = String(form.elements.agentMessage?.value || "").trim();
  const task = tasks.find((item) => item.id === taskId);
  if (!task || !isReceivedAgentTask(task)) return;
  const subtask = subtaskId ? (task.subtasks || []).find((item) => item.id === subtaskId) : null;
  const target = subtask || task;
  const now = new Date().toISOString();
  const previousProgress = Number(target.progress || 0);
  const nextProgress = Number(form.elements.agentProgress?.value || previousProgress);
  const sourceMode = form.elements.agentMediaSource?.value || "library";
  const mediaFiles = Array.from(form.elements.agentMedia?.files || []);
  const relatedFiles = Array.from(form.elements.agentFiles?.files || []);
  const gps = sourceMode === "app" ? await getCurrentGpsIfCamera("app") : "";
  const media = await readMediaFiles(mediaFiles, gps, { sourceMode, requiresOwnerReview: true });
  const files = await readStoredFiles(relatedFiles, { requiresOwnerReview: true });
  const progressChanged = nextProgress !== previousProgress;
  if (!cleanText && !media.length && !files.length && !progressChanged) return;

  const note = {
    id: createId(),
    text: cleanText || (progressChanged ? `Avance actualizado de ${previousProgress}/10 a ${nextProgress}/10.` : "Evidencias aportadas."),
    agent: cloudStore?.getUser?.()?.email || "Agente",
    gps: "",
    addedAt: now,
    uploadedByRole: "agent",
    requiresOwnerReview: true,
    reviewedAt: "",
    taskId: task.sharedSourceTaskId || task.sourceTaskId || "",
    subtaskId: subtask?.sharedSourceSubtaskId || subtask?.sourceSubtaskId || "",
    progress: nextProgress
  };
  target.agentNotes = [...(target.agentNotes || []), note];
  target.photos = [...(target.photos || []), ...media];
  target.files = [...(target.files || []), ...files];
  target.progress = nextProgress;
  target.needsReview = true;
  task.updatedAt = now;
  await syncAgentMessageToInvitation(task, subtask, { note, media, files, progress: nextProgress });
  saveTasks();
  renderAgentExecutionView(task, subtask);
}

async function syncAgentMessageToInvitation(task, subtask, update) {
  const invitationId = task.sharedInvitationId || subtask?.sharedInvitationId || "";
  if (!invitationId || !cloudStore?.updateInvitation) return;
  const invitation = incomingInvitations.find((item) => item.id === invitationId) || {};
  const updates = [...(invitation.agentUpdates || [])];
  if (!updates.some((item) => item.id === update.note.id)) {
    updates.push({
      ...update.note,
      media: update.media || [],
      files: update.files || [],
      progress: update.progress,
      sourceTaskId: task.sharedSourceTaskId || invitation.taskId || "",
      sourceSubtaskId: subtask?.sharedSourceSubtaskId || invitation.subtaskId || ""
    });
  }
  try {
    await cloudStore.updateInvitation(invitationId, { agentUpdates: updates, lastAgentUpdateAt: update.note.addedAt });
    invitation.agentUpdates = updates;
  } catch (error) {
    console.error("No se pudo enviar el mensaje al propietario.", error);
  }
}

function renderSubtaskRow(task, subtask) {
  const visibleCount = getSubtaskPermissions(task, subtask.id).filter((permission) => permission.status !== "suspended").length;
  const mediaCount = (subtask.photos || []).length;
  const fileCount = (subtask.files || []).length;
  const dueDate = subtask.dueDate || task.dueDate || "";
  const created = subtask.createdAt || task.createdAt;
  const agent = subtask.agent || (subtask.agents || [])[0] || "Sin agente";
  const title = subtask.title || task.title;
  return `
    <article class="subtask-row ${subtask.status || "new"} ${hasUnreadSubtaskUploads(subtask) ? "needs-review" : ""}">
      <div>
        <div class="subtask-title-line">
          <span class="subtask-marker" aria-label="Subtarea"></span>
          <strong>${escapeHtml(title)}</strong>
          ${renderPeopleSignal(task, subtask)}
        </div>
        <p class="task-meta">Tarea: ${escapeHtml(task.title)} - Agente: ${escapeHtml(agent)} - ${statusLabels[subtask.status] || subtask.status || "Nueva"} - ${agentInviteStatusLabel(subtask)}</p>
        <div class="subtask-facts">
          <span class="tag">Alta ${formatDate(created)}</span>
          <span class="tag">Prevista ${dueDate ? formatDate(dueDate) : "sin fecha"}</span>
          <span class="tag">${formatDaysUntil(dueDate)}</span>
          <span class="assignment-status ${subtask.agentInviteStatus || "pending"}">${agentInviteStatusLabel(subtask)}</span>
        </div>
        <div class="media-strip">
          ${renderEvidenceCounters(subtask.photos || [], subtask.files || [], subtask.agentNotes || [], { always: true })}
        </div>
      </div>
      <div class="subtask-actions">
        <div class="subtask-progress">
          <span>${Number(subtask.progress || 0)}/10</span>
          <div class="progress-mini"><span style="width:${Number(subtask.progress || 0) * 10}%"></span></div>
        </div>
        <button class="small-button" data-action="edit-subtask" data-subtask-id="${subtask.id}" type="button">Editar</button>
        <button class="small-button" data-action="view-subtask" data-subtask-id="${subtask.id}" type="button">Ver</button>
        <button class="small-button" data-action="share-subtask" data-subtask-id="${subtask.id}" type="button">Enviar</button>
        <button class="small-button" data-action="grant-guest-subtask" data-subtask-id="${subtask.id}" type="button">Invitar visor</button>
      </div>
    </article>
  `;
}

function renderEvidenceLibrary(task, mediaItems = [], files = [], scope, subtaskId, options = {}) {
  const groups = [
    {
      key: "owner",
      title: "Mis cargas",
      note: "Fotos, videos, audios y documentos incorporados por el propietario."
    },
    {
      key: "agent",
      title: "Cargas de agentes",
      note: "Material aportado por agentes en la tarea o subtarea."
    },
    {
      key: "unknown",
      title: "Sin clasificar",
      note: "Evidencias antiguas sin origen registrado."
    }
  ];

  const content = groups.map((group) => {
    const groupMedia = mediaItems.filter((item) => getEvidenceOwnerGroup(item) === group.key);
    const groupFiles = files.filter((item) => getEvidenceOwnerGroup(item) === group.key);
    if (!groupMedia.length && !groupFiles.length) return "";
    const photos = groupMedia.filter((item) => (item.type || "").startsWith("image/"));
    const videos = groupMedia.filter((item) => (item.type || "").startsWith("video/"));
    const audios = groupMedia.filter((item) => (item.type || "").startsWith("audio/"));
    return `
      <article class="evidence-library-group">
        <div class="panel-title">
          <div>
            <h4>${group.title}</h4>
            <p class="task-meta">${group.note}</p>
          </div>
          <div class="media-strip">${renderEvidenceCounters(groupMedia, groupFiles)}</div>
        </div>
        ${renderEvidenceTypeBlock("Fotos", photos, () => `<div class="photo-grid">${renderMediaGrid(task, photos, scope, subtaskId, options)}</div>`)}
        ${renderEvidenceTypeBlock("Videos", videos, () => `<div class="photo-grid">${renderMediaGrid(task, videos, scope, subtaskId, options)}</div>`)}
        ${renderEvidenceTypeBlock("Audios", audios, () => `<div class="photo-grid">${renderMediaGrid(task, audios, scope, subtaskId, options)}</div>`)}
        ${renderEvidenceTypeBlock("Documentos y archivos", groupFiles, () => renderFileList(groupFiles, scope, subtaskId, options))}
      </article>
    `;
  }).join("");

  return content || "<p class=\"task-meta\">Sin fotos, videos, audios ni archivos asociados.</p>";
}

function renderEvidenceTypeBlock(title, items, renderContent) {
  if (!items.length) return "";
  return `
    <section class="evidence-type-block">
      <h5>${title} <span>${items.length}</span></h5>
      ${renderContent()}
    </section>
  `;
}

function getEvidenceOwnerGroup(item) {
  if (item?.uploadedByRole === "owner") return "owner";
  if (item?.uploadedByRole === "agent") return "agent";
  return "unknown";
}

function getMediaSourceLabel(media) {
  if (media?.source === "library") return "Dispositivo";
  if (media?.source === "microphone") return "Microfono";
  return "Camara";
}

function getMediaSourceShortLabel(media) {
  if (media?.source === "library") return "DISPOSITIVO";
  if (media?.source === "microphone") return "MICROFONO";
  return "CAMARA";
}

function renderMediaGrid(task, mediaItems, scope, subtaskId, options = {}) {
  if (!mediaItems?.length) return "<p class=\"task-meta\">Sin evidencias asociadas.</p>";
  return mediaItems.map((media) => `
    <article class="photo-card ${isUnreadEvidence(media) ? "needs-review" : ""}">
      <button class="media-preview-button" data-action="open-media-viewer" data-media-id="${media.id}" data-scope="${scope}" data-subtask-id="${subtaskId}" type="button" aria-label="Ver evidencia a pantalla completa">
        ${renderMediaPreview(media, task.title, false)}
      </button>
      <p><strong>${getMediaSourceLabel(media)}</strong>${media.stamped ? " - sello visible" : ""}<br>${formatDateTime(media.addedAt)}<br>${escapeHtml(media.gps || "GPS no indicado")}</p>
      <div class="media-actions">
        <button class="small-button" data-action="open-media-viewer" data-media-id="${media.id}" data-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Ver grande</button>
        <a class="small-button" href="${media.dataUrl}" target="_blank" rel="noopener" data-action="review-media-link" data-media-id="${media.id}">Abrir</a>
        <a class="small-button" href="${media.dataUrl}" download="${escapeHtml(media.name || "evidencia")}" data-action="review-media-link" data-media-id="${media.id}">Descargar</a>
        ${options.readonly ? "" : `<button class="small-button danger-button" data-action="delete-media" data-media-id="${media.id}" data-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Eliminar</button>`}
      </div>
    </article>
  `).join("");
}

function renderMediaPreview(media, title, interactive = true) {
  const type = media.type || "";
  if (type.startsWith("video/")) return `<video src="${media.dataUrl}" ${interactive ? "controls" : ""} muted preload="metadata"></video>`;
  if (type.startsWith("audio/")) {
    return interactive
      ? `<audio src="${media.dataUrl}" controls></audio>`
      : `<div class="audio-preview"><span>Audio</span><strong>${escapeHtml(media.name || "Evidencia de audio")}</strong></div>`;
  }
  return `<img src="${media.dataUrl}" alt="Evidencia de ${escapeHtml(title)}">`;
}

function openMediaViewer(items, mediaId) {
  mediaViewerItems = (items || []).filter((item) => item?.dataUrl);
  if (!mediaViewerItems.length) return;
  mediaViewerIndex = Math.max(0, mediaViewerItems.findIndex((item) => item.id === mediaId));
  if (mediaViewerIndex < 0) mediaViewerIndex = 0;
  renderMediaViewer();
  if (!els.mediaViewerDialog.open) els.mediaViewerDialog.showModal();
  requestMediaFullscreen();
}

function renderMediaViewer() {
  const media = mediaViewerItems[mediaViewerIndex];
  if (!media) return;
  markMediaReviewed(media.id);
  const type = media.type || "";
  const title = media.subtaskTitle || media.taskTitle || media.name || "Evidencia";
  els.mediaViewerTitle.textContent = title;
  els.mediaViewerScope.textContent = media.subtaskTitle ? `Subtarea de ${media.taskTitle}` : "Tarea principal";
  els.mediaViewerMeta.textContent = `${mediaViewerIndex + 1} de ${mediaViewerItems.length} · ${formatDateTime(media.addedAt)} · ${media.gps || "GPS no indicado"}`;

  if (type.startsWith("video/")) {
    els.mediaViewerStage.innerHTML = `<video src="${media.dataUrl}" controls autoplay playsinline></video>`;
    return;
  }

  if (type.startsWith("audio/")) {
    els.mediaViewerStage.innerHTML = `
      <div class="media-viewer-audio">
        <span>Audio</span>
        <strong>${escapeHtml(media.name || title)}</strong>
        <audio src="${media.dataUrl}" controls autoplay></audio>
      </div>
    `;
    return;
  }

  els.mediaViewerStage.innerHTML = `<img src="${media.dataUrl}" alt="Evidencia de ${escapeHtml(title)}">`;
}

function stepMediaViewer(delta) {
  if (!mediaViewerItems.length) return;
  mediaViewerIndex = (mediaViewerIndex + delta + mediaViewerItems.length) % mediaViewerItems.length;
  renderMediaViewer();
}

function closeMediaViewer() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (els.mediaViewerDialog.open) els.mediaViewerDialog.close();
  els.mediaViewerStage.innerHTML = "";
  render();
}

function requestMediaFullscreen() {
  const shell = els.mediaViewerDialog.querySelector(".media-viewer-shell");
  if (!shell?.requestFullscreen || document.fullscreenElement) return;
  shell.requestFullscreen().catch(() => {});
}

function renderEvidenceCounters(mediaItems = [], files = [], textItems = [], options = {}) {
  const groups = [
    { label: "VID", title: "Videos", total: mediaItems.filter((item) => (item.type || "").startsWith("video/")).length, unread: mediaItems.filter((item) => (item.type || "").startsWith("video/") && isUnreadEvidence(item)).length },
    { label: "AUD", title: "Audios", total: mediaItems.filter((item) => (item.type || "").startsWith("audio/")).length, unread: mediaItems.filter((item) => (item.type || "").startsWith("audio/") && isUnreadEvidence(item)).length },
    { label: "DOC", title: "Documentos y archivos", total: files.length, unread: files.filter(isUnreadEvidence).length },
    { label: "FOTO", title: "Fotos", total: mediaItems.filter((item) => (item.type || "").startsWith("image/")).length, unread: mediaItems.filter((item) => (item.type || "").startsWith("image/") && isUnreadEvidence(item)).length }
  ];
  const unreadText = textItems.filter(isUnreadAgentText).length;
  const textTotal = textItems.length;
  const visibleGroups = options.always ? groups : groups.filter((group) => group.total > 0);
  if (!visibleGroups.length && !textTotal && !options.always) return "";

  return `
    <span class="evidence-summary" title="Formato: total/nuevo pendiente de revisar">
      ${visibleGroups.map((group) => `
        <span class="evidence-token ${group.unread ? "has-unread" : ""}" title="${group.title}: ${group.total} total, ${group.unread} nuevo(s)">
          <strong>${group.label}:</strong> ${group.total}/<em>${group.unread}</em>
        </span>
      `).join("")}
      <span class="evidence-token text-token ${unreadText ? "has-unread" : ""}" title="Textos del agente: ${textTotal} total, ${unreadText} nuevo(s)">
        <strong>TEXTO:</strong> ${unreadText ? "<em>SI</em>" : textTotal}
      </span>
    </span>
  `;
}

function renderPeopleSignal(task, subtask = null) {
  if (isReceivedAgentTask(task) || isReceivedViewerTask(task)) {
    return "<span class=\"people-signal\" aria-label=\"Orden recibida\"></span>";
  }

  const agentState = getAgentSignalState(task, subtask);
  const viewerState = getViewerSignalState(task, subtask);
  const agentTitle = agentState.total
    ? `${agentState.total} agente(s): ${agentState.accepted} aceptado(s), ${agentState.pending} pendiente(s)`
    : "Sin agentes asignados";
  const viewerTitle = viewerState.total
    ? `${viewerState.total} invitado(s): ${viewerState.accepted} aceptado(s), ${viewerState.pending} pendiente(s)`
    : "Sin invitados visualizando";

  return `
    <span class="people-signal" aria-label="Agentes e invitados">
      ${agentState.total ? `<span class="agent-letter ${agentState.pending ? "pending" : "accepted"}" title="${agentTitle}">A</span>` : ""}
      ${viewerState.total ? `<span class="viewer-letter ${viewerState.pending ? "pending" : "accepted"}" title="${viewerTitle}">V</span>` : ""}
    </span>
  `;
}

function getAgentSignalState(task, subtask = null) {
  if (subtask) {
    const total = (subtask.agent || (subtask.agents || []).length) ? 1 : 0;
    const accepted = subtask.agentInviteStatus === "accepted" ? total : 0;
    return { total, accepted, pending: Math.max(0, total - accepted) };
  }

  const assignedSubtasks = (task.subtasks || []).filter((item) => item.agent || (item.agents || []).length);
  const taskAgentCount = task.agents?.length || 0;
  const total = assignedSubtasks.length || taskAgentCount;
  const accepted = assignedSubtasks.length
    ? assignedSubtasks.filter((item) => item.agentInviteStatus === "accepted").length
    : task.agentInviteStatus === "accepted" ? total : 0;
  return { total, accepted, pending: Math.max(0, total - accepted) };
}

function getViewerSignalState(task, subtask = null) {
  const permissions = (task.guestPermissions || []).filter((permission) => {
    if (permission.status === "suspended") return false;
    if (!subtask) return permission.scope === "task";
    return permission.scope === "task" || permission.subtaskId === subtask.id;
  });
  const total = permissions.length;
  const accepted = permissions.filter((permission) => permission.status === "accepted").length;
  return { total, accepted, pending: Math.max(0, total - accepted) };
}

function markMediaReviewed(mediaId) {
  if (!mediaId) return false;
  let changed = false;
  tasks.forEach((task) => {
    let taskChanged = false;
    (task.photos || []).forEach((media) => {
      if (media.id === mediaId && isUnreadEvidence(media)) {
        media.reviewedAt = new Date().toISOString();
        changed = true;
        taskChanged = true;
      }
    });
    (task.subtasks || []).forEach((subtask) => {
      (subtask.photos || []).forEach((media) => {
        if (media.id === mediaId && isUnreadEvidence(media)) {
          media.reviewedAt = new Date().toISOString();
          changed = true;
          taskChanged = true;
        }
      });
      subtask.needsReview = hasUnreadSubtaskEvidence(subtask);
    });
    if (taskChanged) task.updatedAt = new Date().toISOString();
  });
  if (changed) saveTasks();
  return changed;
}

function markFileReviewed(task, fileId, scope, subtaskId) {
  if (!fileId) return false;
  const files = scope === "subtask"
    ? (task.subtasks || []).find((subtask) => subtask.id === subtaskId)?.files || []
    : task.files || [];
  const file = files.find((item) => item.id === fileId);
  if (!file || !isUnreadEvidence(file)) return false;
  file.reviewedAt = new Date().toISOString();
  if (scope === "subtask") {
    const subtask = (task.subtasks || []).find((item) => item.id === subtaskId);
    if (subtask) subtask.needsReview = hasUnreadSubtaskEvidence(subtask);
  }
  task.updatedAt = new Date().toISOString();
  saveTasks();
  return true;
}

function renderFileList(files, scope, subtaskId, options = {}) {
  if (!files?.length) return "<p class=\"task-meta\">Sin archivos asociados.</p>";
  return `<div class="file-list">${files.map((file) => `
    <article class="file-row ${isUnreadEvidence(file) ? "needs-review" : ""}">
      <div>
        <strong>${escapeHtml(file.name || "Archivo")}</strong>
        <span class="task-meta">${escapeHtml(file.type || "tipo desconocido")} - ${formatBytes(file.size || 0)} - ${formatDateTime(file.addedAt)}${isUnreadEvidence(file) ? " - Pendiente de revisar" : ""}</span>
      </div>
      <div class="file-actions">
        <a class="small-button" href="${file.dataUrl}" target="_blank" rel="noopener" data-action="open-file" data-file-id="${file.id}" data-scope="${scope}" data-subtask-id="${subtaskId}">Abrir</a>
        <a class="small-button" href="${file.dataUrl}" download="${escapeHtml(file.name || "archivo")}" data-action="open-file" data-file-id="${file.id}" data-scope="${scope}" data-subtask-id="${subtaskId}">Descargar</a>
        ${options.readonly ? "" : `<button class="small-button danger-button" data-action="delete-file" data-file-id="${file.id}" data-scope="${scope}" data-subtask-id="${subtaskId}" type="button">Eliminar</button>`}
      </div>
    </article>
  `).join("")}</div>`;
}

function renderSummaryDetail(viewName) {
  const titleMap = {
    subtasks: "Listado de subtareas",
    "subtasks-pending": "Subtareas pendientes",
    "subtasks-done": "Subtareas terminadas",
    "subtasks-overdue": "Subtareas vencidas",
    guests: "Listado de invitados"
  };
  const content = viewName === "guests" ? renderGuestSummaryRows() : renderSubtaskSummaryRows();
  els.detailPanel.innerHTML = `
    <section class="detail-head">
      <p class="eyebrow">Totales</p>
      <h2>${titleMap[viewName] || "Resumen"}</h2>
    </section>
    <section class="section-block">
      ${content}
    </section>
  `;
}

function renderSubtaskSummaryRows() {
  const rows = getFilteredSubtaskAssignments(selectedSummaryView);
  if (!rows.length) return "<p class=\"task-meta\">No hay subtareas creadas.</p>";
  return rows.map(({ task, subtask }) => `
    <button class="summary-row" type="button" data-action="summary-open-subtask" data-task-id="${task.id}" data-subtask-id="${subtask.id}">
      <div>
        <strong>${escapeHtml(subtask.title || task.title)}</strong>
        <span class="task-meta">Tarea: ${escapeHtml(task.title)} - Agente: ${escapeHtml(subtask.agent || "Sin agente")} - Alta ${formatDate(subtask.createdAt || task.createdAt)} - Prevista ${formatDate(subtask.dueDate || task.dueDate || "")} - ${formatDaysUntil(subtask.dueDate || task.dueDate)}</span>
      </div>
          ${renderEvidenceCounters(subtask.photos || [], subtask.files || [], subtask.agentNotes || [], { always: true })}
      <span class="tag">${formatDaysUntil(subtask.dueDate || task.dueDate)}</span>
    </button>
  `).join("");
}

function renderGuestSummaryRows() {
  if (!guestDirectory.length) return "<p class=\"task-meta\">No hay invitados creados.</p>";
  return guestDirectory.map((guest) => {
    const assignments = getGuestAssignments(guest.id, guest.name);
    const active = assignments.filter((item) => item.permission.status !== "suspended").length;
    const suspended = assignments.filter((item) => item.permission.status === "suspended").length;
    const taskCount = assignments.filter((item) => item.permission.scope === "task").length;
    const subtaskCount = assignments.filter((item) => item.permission.scope === "subtask").length;
    return `
      <article class="summary-row">
        <div>
          <strong>${escapeHtml(guest.name)}</strong>
          <span class="task-meta">${escapeHtml(guest.phone || "Sin WhatsApp")} - ${escapeHtml(guest.email || "Sin email")}</span>
        </div>
        <span class="tag">${active} visibles</span>
        <span class="tag">${suspended} en pausa</span>
        <span class="tag">${taskCount} tareas</span>
        <span class="tag">${subtaskCount} subtareas</span>
      </article>
    `;
  }).join("");
}

function renderChart() {
  const buckets = [
    ["Pendientes", tasks.filter((task) => task.status !== "done").length],
    ["Terminadas", tasks.filter((task) => task.status === "done").length],
    ["Pausa", tasks.filter((task) => task.status === "paused").length],
    ["Vencidas", tasks.filter(isOverdue).length]
  ];
  const max = Math.max(1, ...buckets.map((item) => item[1]));
  els.progressBars.innerHTML = buckets.map(([label, value]) => `
    <div class="bar-row">
      <span>${label}</span>
      <div class="bar-track"><span style="width:${(value / max) * 100}%"></span></div>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function getVisibleTasks() {
  const term = filters.search.value.trim().toLowerCase();
  const status = filters.status.value;
  const type = filters.type.value;
  const category = filters.category.value;
  const media = filters.media.value;

  return tasks
    .filter((task) => {
      if (status === "pending" && task.status === "done") return false;
      if (status === "done" && task.status !== "done") return false;
      if (status === "paused" && task.status !== "paused") return false;
      if (status === "overdue" && !isOverdue(task)) return false;
      if (status === "soon" && !isDueSoon(task)) return false;
      if (status === "workorders" && !isReceivedAgentTask(task)) return false;
      if (status === "workorders-alert" && !hasAgentWorkOrderAlert(task)) return false;
      if (type !== "all" && task.type !== type) return false;
      if (category !== "all" && task.category !== category) return false;
      const evidenceCount = getTaskMediaCount(task) + getTaskFileCount(task);
      if (media === "with" && !evidenceCount) return false;
      if (media === "without" && evidenceCount) return false;
      if (media === "review" && !hasUnreadUploads(task)) return false;
      return true;
    })
    .filter((task) => {
      const subtaskText = (task.subtasks || []).map((subtask) => `${subtask.title} ${subtask.agent || ""} ${subtask.description || ""}`).join(" ");
      const fileText = [...(task.files || []), ...(task.subtasks || []).flatMap((subtask) => subtask.files || [])].map((file) => file.name).join(" ");
      const text = [task.title, task.description, task.category, task.priority, ...(task.keywords || []), ...(task.agents || []), ...(task.viewers || []), subtaskText, fileText].join(" ").toLowerCase();
      return text.includes(term);
    })
    .sort(sortTasks)
    .sort((a, b) => {
      if (!highlightedFromGallery.taskId) return 0;
      if (a.id === highlightedFromGallery.taskId) return -1;
      if (b.id === highlightedFromGallery.taskId) return 1;
      return 0;
    });
}

function sortTasks(a, b) {
  const mode = filters.sort.value;
  if (mode === "reminderAsc") return compareReminder(a, b);
  if (mode === "dueDesc") return compareDue(b, a);
  if (mode === "createdDesc") return b.createdAt.localeCompare(a.createdAt);
  if (mode === "createdAsc") return a.createdAt.localeCompare(b.createdAt);
  if (mode === "titleAsc") return a.title.localeCompare(b.title);
  if (mode === "statusAsc") return a.status.localeCompare(b.status);
  return compareDue(a, b);
}

function compareDue(a, b) {
  return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
}

function compareReminder(a, b) {
  return getTaskReminderSortKey(a).localeCompare(getTaskReminderSortKey(b));
}

function getTaskReminderSortKey(task) {
  return task.reminder || task.dueDate || task.createdAt || "9999-12-31";
}

async function buildEntryFromForm() {
  const validation = getAttachmentValidation();
  if (!validation.ok) {
    showAttachmentStatus(validation.message, true);
    return null;
  }

  const gps = fields.gps.value.trim() || await getCurrentGpsIfCamera();
  const media = await readMediaFiles(Array.from(fields.photo.files || []), gps);
  const files = await readStoredFiles(Array.from(fields.files.files || []));
  const now = new Date().toISOString();
  const agents = splitList(fields.agents.value);

  return {
    id: editingId || createId(),
    title: fields.title.value.trim(),
    type: fields.type.value,
    status: fields.status.value,
    dueDate: fields.due.value,
    reminder: fields.reminder.value,
    category: fields.category.value,
    priority: fields.priority.value,
    keywords: splitList(fields.keywords.value),
    agents,
    agentInviteStatus: agents.length ? "pending" : "",
    agentInviteSentAt: "",
    agentAcceptedAt: "",
    viewers: splitList(fields.viewers.value),
    description: fields.description.value.trim(),
    captureGps: gps,
    progress: Number(fields.progress.value),
    createdAt: now,
    updatedAt: now,
    completedAt: fields.status.value === "done" ? now : "",
    photos: media,
    files,
    history: [{ at: now, text: editingId ? "Tarea editada" : "Tarea creada" }]
  };
}

function mergeEditedTask(previous, next) {
  const previousAgents = (previous.agents || []).join("|");
  const nextAgents = (next.agents || []).join("|");
  const sameAgents = previousAgents === nextAgents;
  const instructionsChanged = (previous.description || "").trim() !== (next.description || "").trim();
  return {
    ...previous,
    ...next,
    createdAt: previous.createdAt,
    ownerInstructionsUpdatedAt: instructionsChanged ? new Date().toISOString() : previous.ownerInstructionsUpdatedAt || "",
    completedAt: next.status === "done" ? (previous.completedAt || new Date().toISOString()) : "",
    photos: [...(previous.photos || []), ...(next.photos || [])],
    files: [...(previous.files || []), ...(next.files || [])],
    agentInviteStatus: sameAgents ? (previous.agentInviteStatus || next.agentInviteStatus || "") : (next.agents?.length ? "pending" : ""),
    agentInviteSentAt: sameAgents ? (previous.agentInviteSentAt || "") : "",
    agentAcceptedAt: sameAgents ? (previous.agentAcceptedAt || "") : "",
    subtasks: previous.subtasks || [],
    guestPermissions: previous.guestPermissions || [],
    contracts: previous.contracts || [],
    history: [...(previous.history || []), { at: new Date().toISOString(), text: "Tarea editada" }]
  };
}

function openDialog(task = null) {
  dialogMode = "task";
  subtaskParentId = "";
  editingSubtaskId = "";
  editingId = task?.id || null;
  els.dialogTitle.textContent = editingId ? "Editar tarea" : "Nueva tarea";
  els.submitTaskButton.textContent = editingId ? "Guardar tarea" : "Crear tarea";
  fields.title.value = task?.title || "";
  fields.type.value = task?.type || "personal";
  fields.status.value = task?.status || "new";
  fields.due.value = task?.dueDate || "";
  fields.reminder.value = task?.reminder || "";
  fields.category.value = task?.category || "Personal";
  fields.priority.value = task?.priority || "media";
  fields.keywords.value = task?.keywords?.join(", ") || "";
  fields.agents.value = task?.agents?.join(", ") || "";
  refreshAgentSelectOptions(task?.agents?.[0] || "");
  fields.viewers.value = task?.viewers?.join(", ") || "";
  refreshViewerSelectOptions(task?.viewers?.[0] || "");
  fields.description.value = task?.description || "";
  fields.progress.value = task?.progress || 0;
  fields.photo.value = "";
  fields.files.value = "";
  fields.photoSource.value = "library";
  fields.gps.value = "";
  updateMediaCaptureMode();
  showAttachmentStatus("");
  els.dialog.showModal();
  fields.title.focus();
}

function openSubtaskDialog(parentTask, subtask = null) {
  dialogMode = "subtask";
  subtaskParentId = parentTask.id;
  editingSubtaskId = subtask?.id || "";
  editingId = subtask?.id || "";
  els.dialogTitle.textContent = editingSubtaskId ? "Editar subtarea" : "Nueva subtarea";
  els.submitTaskButton.textContent = editingSubtaskId ? "Guardar subtarea" : "Crear subtarea";
  fields.title.value = subtask?.title || parentTask.title;
  fields.type.value = parentTask.type || "shared";
  fields.status.value = subtask?.status || "new";
  fields.due.value = subtask?.dueDate || parentTask.dueDate || "";
  fields.reminder.value = subtask?.reminder || parentTask.reminder || "";
  fields.category.value = subtask?.category || parentTask.category || "Personal";
  fields.priority.value = subtask?.priority || parentTask.priority || "media";
  fields.keywords.value = subtask?.keywords?.join(", ") || parentTask.keywords?.join(", ") || "";
  fields.agents.value = subtask?.agent || subtask?.agents?.join(", ") || parentTask.agents?.[0] || "";
  refreshAgentSelectOptions(subtask?.agent || subtask?.agents?.[0] || parentTask.agents?.[0] || "");
  fields.viewers.value = subtask?.viewers?.join(", ") || parentTask.viewers?.join(", ") || "";
  refreshViewerSelectOptions(subtask?.viewers?.[0] || parentTask.viewers?.[0] || "");
  fields.description.value = subtask?.description || "";
  fields.progress.value = subtask?.progress || 0;
  fields.photo.value = "";
  fields.files.value = "";
  fields.photoSource.value = "library";
  fields.gps.value = "";
  updateMediaCaptureMode();
  showAttachmentStatus("");
  els.dialog.showModal();
  fields.title.focus();
}

function closeDialog() {
  editingId = null;
  dialogMode = "task";
  subtaskParentId = "";
  editingSubtaskId = "";
  els.form.reset();
  fields.category.value = "Personal";
  fields.priority.value = "media";
  fields.progress.value = 0;
  fields.photoSource.value = "library";
  refreshViewerSelectOptions();
  updateMediaCaptureMode();
  showAttachmentStatus("");
  els.dialog.close();
}

function saveSubtaskFromDialog(entry) {
  const parent = tasks.find((task) => task.id === subtaskParentId);
  if (!parent) return;
  parent.subtasks = parent.subtasks || [];
  const previousSubtask = editingSubtaskId
    ? parent.subtasks.find((item) => item.id === editingSubtaskId)
    : null;
  const agents = dialogMode === "subtask"
    ? splitList(fields.agents.value).slice(0, 1)
    : entry.agents || [];
  const agentNotes = previousSubtask?.agentNotes || [];
  const subtask = {
    ...entry,
    id: editingSubtaskId || createId(),
    parentTaskId: parent.id,
    parentTitle: parent.title,
    agent: agents[0] || "",
    agents,
    agentInviteStatus: editingSubtaskId ? "pending" : "pending",
    agentInviteSentAt: "",
    agentAcceptedAt: "",
    viewers: entry.viewers || [],
    agentNotes,
    needsReview: Boolean([...(entry.photos || []), ...(entry.files || [])].some(isUnreadEvidence) || agentNotes.some(isUnreadAgentText)),
    history: [{ at: new Date().toISOString(), text: editingSubtaskId ? "Subtarea editada" : "Subtarea creada" }]
  };

  if (editingSubtaskId) {
    parent.subtasks = parent.subtasks.map((item) => item.id === editingSubtaskId ? mergeEditedSubtask(item, subtask) : item);
  } else {
    parent.subtasks.push(subtask);
  }

  const savedSubtask = parent.subtasks.find((item) => item.id === subtask.id);
  if (savedSubtask) ensureViewerPermissions(parent, "subtask", savedSubtask);

  parent.updatedAt = new Date().toISOString();
  selectedId = parent.id;
  saveTasks();
}

function mergeEditedSubtask(previous, next) {
  const previousAgent = previous.agent || (previous.agents || [])[0] || "";
  const nextAgent = next.agent || (next.agents || [])[0] || "";
  const sameAgent = previousAgent === nextAgent;
  const instructionsChanged = (previous.description || "").trim() !== (next.description || "").trim();
  return {
    ...previous,
    ...next,
    createdAt: previous.createdAt,
    ownerInstructionsUpdatedAt: instructionsChanged ? new Date().toISOString() : previous.ownerInstructionsUpdatedAt || "",
    photos: [...(previous.photos || []), ...(next.photos || [])],
    files: [...(previous.files || []), ...(next.files || [])],
    agentNotes: next.agentNotes || previous.agentNotes || [],
    agentInviteStatus: sameAgent ? (previous.agentInviteStatus || "pending") : "pending",
    agentInviteSentAt: sameAgent ? (previous.agentInviteSentAt || "") : "",
    agentAcceptedAt: sameAgent ? (previous.agentAcceptedAt || "") : "",
    needsReview: hasUnreadSubtaskEvidence({
      ...previous,
      ...next,
      photos: [...(previous.photos || []), ...(next.photos || [])],
      files: [...(previous.files || []), ...(next.files || [])],
      agentNotes: next.agentNotes || previous.agentNotes || []
    }),
    history: [...(previous.history || []), { at: new Date().toISOString(), text: "Subtarea editada" }]
  };
}

function buildSubtaskAgentNotes(previousSubtask, text, gps) {
  const notes = [...(previousSubtask?.agentNotes || [])];
  const cleanText = (text || "").trim();
  if (!previousSubtask || !cleanText) return notes;

  const previousDescription = (previousSubtask.description || "").trim();
  const newText = previousDescription && cleanText.startsWith(previousDescription)
    ? cleanText.slice(previousDescription.length).trim()
    : cleanText;
  const lastNoteText = (notes[notes.length - 1]?.text || "").trim();
  if (!newText || cleanText === previousDescription || newText === lastNoteText) return notes;

  const now = new Date().toISOString();
  notes.push({
    id: createId(),
    text: newText,
    agent: previousSubtask.agent || (previousSubtask.agents || [])[0] || "Agente",
    gps: gps || "GPS no indicado",
    addedAt: now,
    requiresOwnerReview: true,
    reviewedAt: ""
  });
  return notes;
}

function updateMediaCaptureMode() {
  const source = fields.photoSource.value;
  fields.photo.removeAttribute("capture");

  if (source === "app") {
    fields.photo.accept = "image/*,video/*";
    fields.photo.setAttribute("capture", "environment");
  } else if (source === "microphone") {
    fields.photo.accept = "audio/*";
    fields.photo.setAttribute("capture", "microphone");
  } else {
    fields.photo.accept = "image/*,video/*,audio/*";
  }

  fields.sourceDevice.classList.toggle("active", source === "library");
  fields.sourceCamera.classList.toggle("active", source === "app");
  fields.sourceMic.classList.toggle("active", source === "microphone");
  updateAttachmentStatus();
}

function setPhotoSource(source) {
  if (fields.photoSource.value === source) return;
  fields.photoSource.value = source;
  fields.photo.value = "";
  updateMediaCaptureMode();
}

function openAuthDialog() {
  authFields.status.textContent = cloudStore?.mode === "firebase"
    ? "Entra con tu email para sincronizar esta agenda en PC y movil."
    : "La agenda esta en modo local. Configura Firebase para activar acceso y sincronizacion.";
  els.authDialog.showModal();
  authFields.email.focus();
}

function closeAuthDialog() {
  els.authForm.reset();
  authFields.status.textContent = "";
  authFields.password.type = "password";
  document.querySelector("#togglePasswordButton").textContent = "Ver";
  if (els.authDialog.open) els.authDialog.close();
}

function togglePasswordVisibility() {
  const button = document.querySelector("#togglePasswordButton");
  const show = authFields.password.type === "password";
  authFields.password.type = show ? "text" : "password";
  button.textContent = show ? "Ocultar" : "Ver";
  button.setAttribute("aria-label", show ? "Ocultar contrasena" : "Ver contrasena");
}

async function submitAuthForm() {
  if (!cloudStore || cloudStore.mode !== "firebase") {
    authFields.status.textContent = "Firebase no esta configurado. Revisa config.js antes de usar cuentas.";
    return;
  }

  const email = authFields.email.value.trim();
  const password = authFields.password.value;
  if (!email || !password) {
    authFields.status.textContent = "Indica email y contrasena.";
    return;
  }

  try {
    authFields.status.textContent = authFields.mode.value === "register" ? "Creando cuenta..." : "Entrando...";
    if (authFields.mode.value === "register") {
      await cloudStore.register(email, password);
    } else {
      await cloudStore.signIn(email, password);
    }
    authFields.status.textContent = "Acceso correcto. Sincronizando agenda...";
  } catch (error) {
    authFields.status.textContent = getAuthErrorMessage(error);
  }
}

async function resetAgendaPassword() {
  if (!cloudStore || cloudStore.mode !== "firebase") {
    authFields.status.textContent = "Firebase no esta configurado. No se puede enviar recuperacion.";
    return;
  }
  const email = authFields.email.value.trim();
  if (!email) {
    authFields.status.textContent = "Escribe tu email para enviarte la recuperacion.";
    authFields.email.focus();
    return;
  }
  try {
    await cloudStore.resetPassword(email);
    authFields.status.textContent = "Email de recuperacion enviado. Revisa tu correo.";
  } catch (error) {
    authFields.status.textContent = getAuthErrorMessage(error);
  }
}

async function signOutAgenda() {
  if (!cloudStore || cloudStore.mode !== "firebase") return;
  await cloudStore.signOut();
  document.querySelector("#syncStatus").textContent = "Sin acceso";
  document.querySelector("#inboxButton")?.classList.add("hidden");
}

function openInboxDialog() {
  renderInboxDialog();
  els.inboxDialog.showModal();
}

function closeInboxDialog() {
  if (els.inboxDialog.open) els.inboxDialog.close();
}

function renderInboxDialog() {
  const pending = incomingInvitations.filter((item) => item.status !== "accepted" && item.status !== "declined");
  els.inboxStatus.textContent = pending.length
    ? `${pending.length} invitacion(es) pendiente(s) para esta cuenta.`
    : "No tienes invitaciones pendientes.";
  els.invitationList.innerHTML = pending.length
    ? pending.map(renderInvitationCard).join("")
    : "<p class=\"task-meta\">Cuando otro usuario te asigne una subtarea o te invite como visualizador, aparecera aqui.</p>";
}

function renderInvitationCard(invitation) {
  const roleText = invitation.role === "agent" ? "Agente asignado" : "Visualizador";
  const scopeText = invitation.scope === "subtask" ? "Subtarea" : "Tarea";
  const subject = invitation.subtask?.title || invitation.task?.title || invitation.title || "Invitacion TRACKION";
  return `
    <article class="invitation-card ${invitation.role || "viewer"}">
      <div>
        <strong>${escapeHtml(subject)}</strong>
        <p class="task-meta">${roleText} - ${scopeText} - De ${escapeHtml(invitation.ownerEmail || "usuario TRACKION")} - ${formatDateTime(invitation.createdAt)}</p>
        <p class="task-meta">${escapeHtml(invitation.task?.title || "")}</p>
      </div>
      <div class="permission-actions">
        <button class="small-button" data-action="accept-invitation" data-invitation-id="${invitation.id}" type="button">Aceptar</button>
      </div>
    </article>
  `;
}

async function acceptIncomingInvitation(invitationId) {
  const invitation = incomingInvitations.find((item) => item.id === invitationId);
  if (!invitation || !cloudStore?.updateInvitation) return;
  const existingTask = tasks.find((task) => task.sharedInvitationId === invitation.id);
  const acceptedTask = existingTask || buildTaskFromInvitation(invitation);
  if (!existingTask && acceptedTask) {
    tasks.unshift(acceptedTask);
    selectedId = acceptedTask.id;
  }
  const now = new Date().toISOString();
  try {
    await cloudStore.updateInvitation(invitation.id, {
      status: "accepted",
      acceptedAt: now,
      acceptedByEmail: cloudStore.getUser()?.email || "",
      acceptedTaskId: acceptedTask?.id || ""
    });
    invitation.status = "accepted";
    invitation.acceptedAt = now;
    invitation.acceptedByEmail = cloudStore.getUser()?.email || "";
    saveTasks();
    render();
    renderInboxDialog();
  } catch (error) {
    console.error("No se pudo aceptar la invitacion.", error);
    els.inboxStatus.textContent = "No se pudo aceptar. Revisa reglas de Firestore y conexion.";
  }
}

function buildTaskFromInvitation(invitation) {
  const now = new Date().toISOString();
  const sourceTask = invitation.task || {};
  if (invitation.scope === "subtask" && invitation.subtask) {
    const parentId = createId();
    const subtask = {
      ...invitation.subtask,
      id: createId(),
      parentTaskId: parentId,
      sharedInvitationId: invitation.id,
      sharedSourceSubtaskId: invitation.subtaskId || invitation.subtask.id || "",
      parentTitle: sourceTask.title || "",
      status: invitation.subtask.status === "done" ? "new" : invitation.subtask.status || "new",
      agentInviteStatus: invitation.role === "agent" ? "accepted" : invitation.subtask.agentInviteStatus || "pending",
      agentAcceptedAt: invitation.role === "agent" ? now : invitation.subtask.agentAcceptedAt || "",
      photos: [],
      files: [],
      contracts: []
    };
    return {
      id: parentId,
      sharedInvitationId: invitation.id,
      sharedOwnerUid: invitation.ownerUid || "",
      sharedOwnerEmail: invitation.ownerEmail || "",
      sharedOwnerName: invitation.ownerName || "",
      sharedRole: invitation.role || "viewer",
      sharedSourceTaskId: invitation.taskId || sourceTask.id || "",
      title: sourceTask.title || subtask.parentTitle || subtask.title,
      type: "shared",
      status: "new",
      dueDate: sourceTask.dueDate || subtask.dueDate || "",
      reminder: sourceTask.reminder || subtask.reminder || "",
      category: sourceTask.category || subtask.category || "Otra",
      priority: sourceTask.priority || subtask.priority || "media",
      keywords: sourceTask.keywords || subtask.keywords || [],
      agents: [],
      viewers: [],
      description: sourceTask.description || "",
      progress: Number(subtask.progress || 0),
      createdAt: now,
      updatedAt: now,
      completedAt: "",
      photos: [],
      files: [],
      subtasks: [subtask],
      guestPermissions: [],
      contracts: [],
      history: [{ at: now, text: `Invitacion aceptada como ${invitation.role === "agent" ? "agente" : "visualizador"}` }]
    };
  }

  return {
    ...sourceTask,
    id: createId(),
    sharedInvitationId: invitation.id,
    sharedOwnerUid: invitation.ownerUid || "",
    sharedOwnerEmail: invitation.ownerEmail || "",
    sharedOwnerName: invitation.ownerName || "",
    sharedRole: invitation.role || "viewer",
    sharedSourceTaskId: invitation.taskId || sourceTask.id || "",
    status: sourceTask.status === "done" ? "new" : sourceTask.status || "new",
    agentInviteStatus: invitation.role === "agent" ? "accepted" : sourceTask.agentInviteStatus || "",
    agentAcceptedAt: invitation.role === "agent" ? now : sourceTask.agentAcceptedAt || "",
    createdAt: now,
    updatedAt: now,
    agents: [],
    viewers: [],
    guestPermissions: [],
    photos: [],
    files: [],
    subtasks: (sourceTask.subtasks || []).map((subtask) => ({
      ...subtask,
      id: createId(),
      sharedInvitationId: invitation.id,
      sharedSourceSubtaskId: subtask.id || "",
      photos: [],
      files: [],
      contracts: []
    })),
    contracts: [],
    history: [...(sourceTask.history || []), { at: now, text: "Invitacion aceptada desde Firebase" }]
  };
}

function applySentInvitationStatuses() {
  if (!sentInvitations.length) return;
  let changed = false;

  sentInvitations.forEach((invitation) => {
    if (invitation.status !== "accepted") return;
    const task = tasks.find((item) => item.id === invitation.taskId);
    if (!task) return;

    if (invitation.role === "agent") {
      if (invitation.scope === "subtask") {
        const subtask = (task.subtasks || []).find((item) => item.id === invitation.subtaskId);
        if (subtask && subtask.agentInviteStatus !== "accepted") {
          subtask.agentInviteStatus = "accepted";
          subtask.agentAcceptedAt = invitation.acceptedAt || new Date().toISOString();
          subtask.agentInviteFirebaseId = invitation.id;
          task.updatedAt = new Date().toISOString();
          changed = true;
        }
        if (subtask && applyAgentUpdatesFromInvitation(task, subtask, invitation)) {
          changed = true;
        }
      } else if (task.agentInviteStatus !== "accepted") {
        task.agentInviteStatus = "accepted";
        task.agentAcceptedAt = invitation.acceptedAt || new Date().toISOString();
        task.agentInviteFirebaseId = invitation.id;
        task.updatedAt = new Date().toISOString();
        changed = true;
      }
      if (invitation.scope !== "subtask" && applyAgentUpdatesFromInvitation(task, null, invitation)) {
        changed = true;
      }
    }

    if (invitation.role === "viewer") {
      const permission = (task.guestPermissions || []).find((item) => item.id === invitation.permissionId);
      if (permission && permission.status !== "accepted") {
        permission.status = "accepted";
        permission.acceptedAt = invitation.acceptedAt || new Date().toISOString();
        permission.firebaseInvitationId = invitation.id;
        permission.acceptedByEmail = invitation.acceptedByEmail || "";
        task.updatedAt = new Date().toISOString();
        changed = true;
      }
    }
  });

  if (changed) {
    saveTasks();
    render();
  }
}

function applyAgentUpdatesFromInvitation(task, subtask, invitation) {
  const updates = invitation.agentUpdates || [];
  if (!updates.length) return false;
  const target = subtask || task;
  target.agentNotes = target.agentNotes || [];
  target.photos = target.photos || [];
  target.files = target.files || [];
  let changed = false;
  updates.forEach((update) => {
    if (!target.agentNotes.some((note) => note.id === update.id)) {
      target.agentNotes.push({
        id: update.id || createId(),
        text: update.text || "",
        agent: update.agent || invitation.recipientEmail || "Agente",
        gps: update.gps || "",
        addedAt: update.addedAt || new Date().toISOString(),
        uploadedByRole: "agent",
        requiresOwnerReview: true,
        reviewedAt: ""
      });
      changed = true;
    }
    (update.media || []).forEach((media) => {
      if (target.photos.some((item) => item.id === media.id)) return;
      target.photos.push({ ...media, uploadedByRole: "agent", requiresOwnerReview: true, reviewedAt: "" });
      changed = true;
    });
    (update.files || []).forEach((file) => {
      if (target.files.some((item) => item.id === file.id)) return;
      target.files.push({ ...file, uploadedByRole: "agent", requiresOwnerReview: true, reviewedAt: "" });
      changed = true;
    });
    if (Number.isFinite(Number(update.progress)) && Number(update.progress) !== Number(target.progress || 0)) {
      target.progress = Number(update.progress);
      changed = true;
    }
  });
  if (changed) {
    target.needsReview = true;
    task.updatedAt = new Date().toISOString();
  }
  return changed;
}

function applyIncomingInvitationUpdates() {
  let changed = false;
  if (linkAcceptedInvitationsToLocalTasks()) changed = true;
  incomingInvitations
    .filter((invitation) => invitation.status === "accepted")
    .forEach((invitation) => {
      const localTask = tasks.find((task) => task.sharedInvitationId === invitation.id);
      if (!localTask) return;
      if (invitation.scope === "subtask") {
        const localSubtask = (localTask.subtasks || [])[0];
        if (!localSubtask || !invitation.subtask) return;
        const nextDescription = invitation.subtask.description || invitation.subtask.instructions || "";
        if (nextDescription && nextDescription !== (localSubtask.description || "")) {
          localSubtask.description = nextDescription;
          localSubtask.ownerInstructionsUpdatedAt = invitation.ownerInstructionsUpdatedAt || invitation.updatedAt || new Date().toISOString();
          localTask.updatedAt = new Date().toISOString();
          changed = true;
        }
      } else if (invitation.task) {
        const nextDescription = invitation.task.description || "";
        if (nextDescription && nextDescription !== (localTask.description || "")) {
          localTask.description = nextDescription;
          localTask.ownerInstructionsUpdatedAt = invitation.ownerInstructionsUpdatedAt || invitation.updatedAt || new Date().toISOString();
          localTask.updatedAt = new Date().toISOString();
          changed = true;
        }
      }
    });
  if (changed) {
    persistAgendaLocally();
    render();
    saveAgendaToCloud();
  }
}

function linkAcceptedInvitationsToLocalTasks() {
  let changed = false;
  incomingInvitations
    .filter((invitation) => invitation.status === "accepted")
    .forEach((invitation) => {
      if (tasks.some((task) => task.sharedInvitationId === invitation.id)) return;
      const title = normalizeCompareText(invitation.subtask?.title || invitation.task?.title || invitation.title || "");
      if (!title) return;
      const candidate = tasks.find((task) =>
        !task.sharedInvitationId &&
        normalizeCompareText(task.title) === title
      );
      if (!candidate) return;
      candidate.sharedInvitationId = invitation.id;
      candidate.sharedOwnerUid = invitation.ownerUid || "";
      candidate.sharedOwnerEmail = invitation.ownerEmail || "";
      candidate.sharedRole = invitation.role || "agent";
      candidate.sharedSourceTaskId = invitation.taskId || invitation.task?.id || "";
      candidate.updatedAt = new Date().toISOString();
      if (invitation.role === "viewer") {
        candidate.receivedRole = "viewer";
      } else {
        candidate.receivedRole = "agent";
        candidate.agentInviteStatus = "accepted";
        candidate.agentAcceptedAt = invitation.acceptedAt || candidate.agentAcceptedAt || "";
      }
      if (invitation.scope === "subtask" && candidate.subtasks?.length) {
        const localSubtask = candidate.subtasks.find((subtask) =>
          normalizeCompareText(subtask.title) === normalizeCompareText(invitation.subtask?.title || "")
        ) || candidate.subtasks[0];
        localSubtask.sharedInvitationId = invitation.id;
        localSubtask.sharedSourceSubtaskId = invitation.subtaskId || invitation.subtask?.id || "";
      }
      changed = true;
    });
  if (changed) persistAgendaLocally();
  return changed;
}

function normalizeCompareText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function syncOwnerInstructionUpdatesToInvitations() {
  if (!sentInvitations.length || !cloudStore?.updateInvitation) return;
  sentInvitations
    .filter((invitation) => invitation.role === "agent")
    .forEach((invitation) => {
      const task = tasks.find((item) => item.id === invitation.taskId);
      if (!task) return;
      const subtask = invitation.subtaskId
        ? (task.subtasks || []).find((item) => item.id === invitation.subtaskId)
        : null;
      const instructionStamp = subtask?.ownerInstructionsUpdatedAt || task.ownerInstructionsUpdatedAt || "";
      if (!instructionStamp || instructionStamp <= (invitation.ownerInstructionsUpdatedAt || "")) return;
      const patch = {
        ownerInstructionsUpdatedAt: instructionStamp,
        task: sanitizeTaskForInvitation(task, { includeSubtasks: invitation.scope === "task" })
      };
      if (subtask) patch.subtask = sanitizeSubtaskForInvitation(subtask);
      cloudStore.updateInvitation(invitation.id, patch).catch((error) => {
        console.warn("No se pudieron actualizar instrucciones en invitacion.", error);
      });
    });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function findAgentByName(name) {
  const normalized = String(name || "").trim().toLowerCase();
  return agentDirectory.find((agent) => agent.name.toLowerCase() === normalized);
}

function sanitizeSubtaskForInvitation(subtask) {
  if (!subtask) return null;
  return {
    id: subtask.id,
    title: subtask.title,
    type: subtask.type || "shared",
    status: subtask.status || "new",
    dueDate: subtask.dueDate || "",
    reminder: subtask.reminder || "",
    category: subtask.category || "",
    priority: subtask.priority || "media",
    keywords: subtask.keywords || [],
    agent: subtask.agent || "",
    agents: subtask.agents || [],
    description: subtask.description || "",
    instructions: subtask.instructions || "",
    progress: Number(subtask.progress || 0),
    createdAt: subtask.createdAt || "",
    updatedAt: subtask.updatedAt || "",
    checkIn: subtask.checkIn || "",
    checkOut: subtask.checkOut || "",
    agentInviteStatus: subtask.agentInviteStatus || "pending"
  };
}

function sanitizeTaskForInvitation(task, options = {}) {
  const subtasks = options.includeSubtasks
    ? (task.subtasks || []).map(sanitizeSubtaskForInvitation).filter(Boolean)
    : [];
  return {
    id: task.id,
    title: task.title,
    type: task.type,
    status: task.status,
    dueDate: task.dueDate || "",
    reminder: task.reminder || "",
    category: task.category || "Otra",
    priority: task.priority || "media",
    keywords: task.keywords || [],
    agents: task.agents || [],
    viewers: task.viewers || [],
    description: task.description || "",
    progress: Number(task.progress || 0),
    createdAt: task.createdAt || "",
    updatedAt: task.updatedAt || "",
    subtasks
  };
}

async function sendFirebaseInvitation(invitation) {
  if (cloudStore?.mode !== "firebase" || !cloudStore.getUser?.() || !cloudStore.sendInvitation) {
    return null;
  }
  return cloudStore.sendInvitation(invitation);
}

function getAuthErrorMessage(error) {
  const code = error?.code || "";
  if (code.includes("invalid-email")) return "Email no valido.";
  if (code.includes("user-not-found") || code.includes("invalid-credential")) return "Usuario o contrasena incorrectos.";
  if (code.includes("wrong-password")) return "Contrasena incorrecta.";
  if (code.includes("email-already-in-use")) return "Ese email ya tiene cuenta. Usa Entrar o recupera contrasena.";
  if (code.includes("weak-password")) return "La contrasena debe tener al menos 6 caracteres.";
  return "No se pudo completar el acceso. Revisa conexion y configuracion Firebase.";
}

function openConfigDialog() {
  configFields.ownerPhone.value = userSettings.ownerPhone || "";
  configFields.storagePreference.value = userSettings.storagePreference || "local";
  configFields.autoWhatsapp.checked = Boolean(userSettings.autoWhatsapp);
  renderLocalStorageStatus();
  renderWhatsappReminderStatus();
  els.configDialog.showModal();
  configFields.ownerPhone.focus();
}

function closeConfigDialog() {
  els.configForm.reset();
  configFields.importDataInput.value = "";
  els.configDialog.close();
}

function openAgentDialog(agent = null) {
  editingAgentId = agent?.id || "";
  els.agentForm.reset();
  agentFields.title.textContent = editingAgentId ? "Editar agente" : "Nuevo agente";
  agentFields.name.value = agent?.name || "";
  agentFields.phone.value = agent?.phone || "";
  agentFields.email.value = agent?.email || "";
  els.agentDialog.showModal();
  agentFields.name.focus();
}

function closeAgentDialog() {
  editingAgentId = "";
  els.agentForm.reset();
  agentFields.title.textContent = "Nuevo agente";
  els.agentDialog.close();
}

function openGuestDialog(guest = null) {
  editingGuestId = guest?.id || "";
  els.guestForm.reset();
  guestFields.title.textContent = editingGuestId ? "Editar invitado" : "Nuevo invitado";
  guestFields.name.value = guest?.name || "";
  guestFields.phone.value = guest?.phone || "";
  guestFields.email.value = guest?.email || "";
  els.guestDialog.showModal();
  guestFields.name.focus();
}

function closeGuestDialog() {
  editingGuestId = "";
  els.guestForm.reset();
  guestFields.title.textContent = "Nuevo invitado";
  els.guestDialog.close();
}

function updateAgentReferences(previousName, nextName) {
  tasks.forEach((task) => {
    task.agents = (task.agents || []).map((name) => name === previousName ? nextName : name);
    (task.subtasks || []).forEach((subtask) => {
      if (subtask.agent === previousName) subtask.agent = nextName;
      subtask.agents = (subtask.agents || []).map((name) => name === previousName ? nextName : name);
    });
  });
  saveTasks();
}

function updateGuestReferences(guestId, previousName, nextName) {
  tasks.forEach((task) => {
    task.viewers = (task.viewers || []).map((name) => name === previousName ? nextName : name);
    (task.guestPermissions || []).forEach((permission) => {
      if (permission.guestId === guestId || permission.guestName === previousName) {
        permission.guestName = nextName;
      }
    });
  });
  saveTasks();
}

function toggleDone(task) {
  task.status = "done";
  task.progress = 10;
  task.completedAt = new Date().toISOString();
  task.history.push({ at: new Date().toISOString(), text: "Marcada como terminada por el creador" });
  saveTasks();
  render();
}

function updateStatus(task, status) {
  task.status = status;
  if (status !== "done") task.completedAt = "";
  task.history.push({ at: new Date().toISOString(), text: `Estado cambiado a ${statusLabels[status]}` });
  saveTasks();
  render();
}

function duplicateTask(task) {
  const copy = {
    ...task,
    id: createId(),
    title: `${task.title} (copia)`,
    status: "new",
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: "",
    history: [{ at: new Date().toISOString(), text: "Tarea duplicada" }]
  };
  tasks.unshift(copy);
  selectedId = copy.id;
  saveTasks();
  render();
}

async function shareTask(task) {
  trackEvent("taskWhatsappShares");
  const now = new Date().toISOString();
  const currentUser = cloudStore?.getUser?.();
  const shared = {
    ...task,
    sharedRole: "agent",
    sharedOwnerEmail: currentUser?.email || "",
    sharedOwnerUid: currentUser?.uid || "",
    sharedSourceTaskId: task.id,
    photos: task.photos.map((photo) => ({
      source: photo.source,
      gps: photo.gps,
      addedAt: photo.addedAt
    })),
    sharedAt: now
  };
  const payload = encodePayload(shared);
  const baseUrl = getAppBaseUrl();
  const taskUrl = `${baseUrl}?import=${encodeURIComponent(payload)}`;
  const primaryAgent = (task.agents || [])[0] || "";
  const agent = findAgentByName(primaryAgent);
  let firebaseSent = false;
  if (agent?.email) {
    try {
      const invitationRef = await sendFirebaseInvitation({
        role: "agent",
        scope: "task",
        recipientEmail: agent.email,
        recipientName: agent.name,
        ownerName: currentUser?.displayName || "",
        taskId: task.id,
        subtaskId: "",
        title: task.title,
        task: sanitizeTaskForInvitation(task, { includeSubtasks: true }),
        status: "pending"
      });
      if (invitationRef?.id) {
        task.agentInviteFirebaseId = invitationRef.id;
        shared.sharedInvitationId = invitationRef.id;
        firebaseSent = true;
      }
    } catch (error) {
      console.error("No se pudo crear invitacion Firebase para tarea.", error);
      alert("No se pudo crear la invitacion Firebase para el agente. Revisa conexion o reglas de Firestore.");
    }
  }
  const message = `Te comparto una tarea de TRACKION AGENDA: ${task.title}\n${firebaseSent ? "Tambien la tienes pendiente en tu bandeja de invitaciones TRACKION.\n" : ""}${taskUrl}`;
  const phone = agent?.phone?.replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener");
  if (task.agents?.length) {
    task.agentInviteStatus = "sent";
    task.agentInviteSentAt = now;
    task.agentAcceptedAt = "";
    task.agentInviteChannel = firebaseSent ? "firebase+whatsapp" : "whatsapp";
    task.updatedAt = now;
    saveTasks();
    render();
  }
}

async function shareSubtask(task, subtask) {
  trackEvent("subtaskWhatsappShares");
  const agentName = subtask.agent || (subtask.agents || [])[0] || "";
  const agent = findAgentByName(agentName);
  const now = new Date().toISOString();
  const currentUser = cloudStore?.getUser?.();
  const shared = {
    sharedRole: "agent",
    sharedOwnerEmail: currentUser?.email || "",
    sharedOwnerUid: currentUser?.uid || "",
    task: {
      id: task.id,
      title: task.title,
      type: task.type,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      description: "Resumen de tarea principal. El detalle completo visible para este agente esta en la subtarea asignada."
    },
    subtask: {
      ...subtask,
      sharedSourceSubtaskId: subtask.id,
      parentTitle: task.title,
      instructions: task.description,
      keywords: task.keywords,
      evidencePolicy: "Fotos APP con fecha/hora/GPS. Fotos de galeria marcadas como FOTOTECA.",
      sharedAt: now
    }
  };
  let firebaseSent = false;
  if (agent?.email) {
    try {
      const invitationRef = await sendFirebaseInvitation({
        role: "agent",
        scope: "subtask",
        recipientEmail: agent.email,
        recipientName: agent.name,
        ownerName: currentUser?.displayName || "",
        taskId: task.id,
        subtaskId: subtask.id,
        title: subtask.title,
        task: sanitizeTaskForInvitation(task),
        subtask: sanitizeSubtaskForInvitation(subtask),
        status: "pending"
      });
      if (invitationRef?.id) {
        subtask.agentInviteFirebaseId = invitationRef.id;
        shared.sharedInvitationId = invitationRef.id;
        firebaseSent = true;
      }
    } catch (error) {
      console.error("No se pudo crear invitacion Firebase para agente.", error);
      alert("No se pudo crear la invitacion Firebase para el agente. Revisa conexion o reglas de Firestore.");
    }
  }
  const payload = encodePayload(shared);
  const baseUrl = getAppBaseUrl();
  const taskUrl = `${baseUrl}?acceptSubtask=${encodeURIComponent(payload)}`;
  const message = `TRACKION AGENDA\n${agentName || "Agente"}, te han asignado una subtarea: ${subtask.title}\nTarea principal: ${task.title}\n${firebaseSent ? "Tambien la tienes pendiente en tu bandeja de invitaciones TRACKION.\n" : ""}Abre este enlace y acepta para incorporarla a tu agenda:\n${taskUrl}`;
  const phone = agent?.phone?.replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener");
  subtask.agentInviteStatus = "sent";
  subtask.agentInviteSentAt = now;
  subtask.agentAcceptedAt = "";
  subtask.agentInviteChannel = firebaseSent ? "firebase+whatsapp" : "whatsapp";
  task.updatedAt = now;
  saveTasks();
  render();
}

function grantNextGuest(task, subtask = null) {
  openPermissionDialog(task, subtask);
  return;

  if (!guestDirectory.length) {
    openGuestDialog();
    return;
  }

  const already = new Set((task.guestPermissions || [])
    .filter((permission) => permission.scope === (subtask ? "subtask" : "task"))
    .map((permission) => `${permission.guestId}:${permission.subtaskId || "task"}`));
  const guest = guestDirectory.find((item) => !already.has(`${item.id}:${subtask?.id || "task"}`)) || guestDirectory[0];
  task.guestPermissions = task.guestPermissions || [];
  task.guestPermissions.push({
    id: createId(),
    guestId: guest.id,
    guestName: guest.name,
    scope: subtask ? "subtask" : "task",
    subtaskId: subtask?.id || "",
    subtaskTitle: subtask?.title || "",
    status: "pending",
    createdAt: new Date().toISOString(),
    acceptedAt: "",
    suspendedAt: "",
    lastViewedAt: "",
    viewCount: 0
  });
  task.viewers = [...new Set([...(task.viewers || []), guest.name])];
  task.updatedAt = new Date().toISOString();
  saveTasks();
  render();
}

function openPermissionDialog(task, subtask = null) {
  if (!guestDirectory.length) {
    openGuestDialog();
    return;
  }

  permissionContext = { taskId: task.id, subtaskId: subtask?.id || "" };
  permissionFields.title.textContent = subtask ? "Permiso para subtarea" : "Permiso para tarea";
  permissionFields.guest.innerHTML = "";
  guestDirectory.forEach((guest) => {
    permissionFields.guest.append(new Option(`${guest.name}${guest.phone ? ` - ${guest.phone}` : ""}`, guest.id));
  });
  permissionFields.scope.value = subtask ? "subtask" : "task";
  permissionFields.status.value = "pending";
  permissionFields.subtask.innerHTML = "";
  permissionFields.subtask.append(new Option("Tarea completa", ""));
  (task.subtasks || []).forEach((item) => {
    permissionFields.subtask.append(new Option(item.title || task.title, item.id));
  });
  permissionFields.subtask.value = subtask?.id || "";
  updatePermissionScopeState();
  els.permissionDialog.showModal();
}

function closePermissionDialog() {
  permissionContext = { taskId: "", subtaskId: "" };
  els.permissionForm.reset();
  permissionFields.note.textContent = "";
  els.permissionDialog.close();
}

function openContractDialog(task, subtask = null) {
  contractContext = { taskId: task.id, subtaskId: subtask?.id || "" };
  const targetTitle = subtask ? subtask.title || task.title : task.title;
  contractFields.title.textContent = subtask ? "Contrato de subtarea" : "Contrato de tarea";
  contractFields.contractTitle.value = `Contrato - ${targetTitle}`.slice(0, 120);
  contractFields.note.value = "";
  contractFields.file.value = "";
  contractFields.status.textContent = "Modulo preparado. La firma certificada se activara al conectar un proveedor eIDAS/API.";
  refreshContractRecipientOptions(task, subtask);
  els.contractDialog.showModal();
  contractFields.contractTitle.focus();
}

function refreshContractRecipientOptions(task, subtask = null) {
  const names = [
    ...(subtask ? [subtask.agent, ...(subtask.agents || [])] : task.agents || []),
    ...agentDirectory.map((agent) => agent.name)
  ].filter(Boolean);
  const uniqueNames = [...new Set(names)];
  contractFields.recipient.innerHTML = "";
  contractFields.recipient.append(new Option("Selecciona agente firmante...", ""));
  uniqueNames.forEach((name) => contractFields.recipient.append(new Option(name, name)));
  contractFields.recipient.value = uniqueNames[0] || "";
}

function closeContractDialog() {
  contractContext = { taskId: "", subtaskId: "" };
  els.contractForm.reset();
  if (els.contractDialog.open) els.contractDialog.close();
}

async function saveContractFromDialog() {
  const task = tasks.find((item) => item.id === contractContext.taskId);
  const subtask = contractContext.subtaskId
    ? (task?.subtasks || []).find((item) => item.id === contractContext.subtaskId)
    : null;
  if (!task) return;

  const file = contractFields.file.files?.[0];
  if (!contractFields.recipient.value) {
    contractFields.status.textContent = "Selecciona el agente firmante antes de guardar el contrato.";
    return;
  }
  if (!file) {
    contractFields.status.textContent = "Selecciona un documento para guardar el contrato.";
    return;
  }
  if (file.size > MAX_LOCAL_ATTACHMENT_BYTES) {
    contractFields.status.textContent = `El contrato pesa ${formatBytes(file.size)}. En modo local el maximo recomendado es ${formatBytes(MAX_LOCAL_ATTACHMENT_BYTES)}.`;
    return;
  }

  const contracts = getContractList(task, subtask);
  const now = new Date().toISOString();
  const version = contracts.reduce((max, contract) => Math.max(max, Number(contract.version || 0)), 0) + 1;
  contracts.push({
    id: createId(),
    version,
    title: contractFields.contractTitle.value.trim() || `Contrato v${version}`,
    recipient: contractFields.recipient.value,
    note: contractFields.note.value.trim(),
    status: "draft",
    provider: "pending",
    createdAt: now,
    updatedAt: now,
    file: {
      id: createId(),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      dataUrl: await readDataUrl(file)
    },
    audit: [{ at: now, text: "Contrato cargado en borrador" }]
  });
  task.updatedAt = now;
  saveTasks();
  closeContractDialog();
  renderContracts();
  subtask ? renderSubtaskView(task, subtask) : renderDetail();
}

function handleContractAction(task, button) {
  const subtask = button.dataset.contractScope === "subtask"
    ? (task.subtasks || []).find((item) => item.id === button.dataset.subtaskId)
    : null;
  const contracts = getContractList(task, subtask);
  const contract = contracts.find((item) => item.id === button.dataset.contractId);
  if (!contract) return;

  const now = new Date().toISOString();
  const action = button.dataset.contractAction;
  if (action === "send") {
    contract.status = "sent";
    contract.sentAt = now;
    addContractAudit(contract, "Contrato enviado al agente");
  }
  if (action === "open") {
    contract.status = "opened";
    contract.openedAt = contract.openedAt || now;
    addContractAudit(contract, "Contrato abierto por el agente");
  }
  if (action === "request-unlock") {
    contract.status = "change_requested";
    contract.unlockRequestedAt = now;
    addContractAudit(contract, "Agente solicita desbloqueo para modificar contrato");
  }
  if (action === "unlock") {
    contract.status = "unlocked";
    contract.unlockedAt = now;
    contract.openedAt = "";
    addContractAudit(contract, "Contrato desbloqueado por propietario");
  }
  if (action === "delete") {
    if (!canDeleteContract(contract)) {
      alert("Este contrato ya fue abierto o firmado. Solo podra borrarse si el agente solicita desbloqueo y queda desbloqueado.");
      return;
    }
    if (!confirm("¿Seguro que quieres borrar este contrato?")) return;
    const nextContracts = contracts.filter((item) => item.id !== contract.id);
    if (subtask) subtask.contracts = nextContracts;
    else task.contracts = nextContracts;
    task.updatedAt = now;
    saveTasks();
    renderContracts();
    subtask ? renderSubtaskView(task, subtask) : renderDetail();
    return;
  }

  contract.updatedAt = now;
  task.updatedAt = now;
  saveTasks();
  renderContracts();
  subtask ? renderSubtaskView(task, subtask) : renderDetail();
}

function addContractAudit(contract, text) {
  contract.audit = contract.audit || [];
  contract.audit.push({ at: new Date().toISOString(), text });
}

function updatePermissionScopeState() {
  const isSubtask = permissionFields.scope.value === "subtask";
  permissionFields.subtask.disabled = !isSubtask;
  if (!isSubtask) permissionFields.subtask.value = "";
  permissionFields.note.textContent = isSubtask
    ? "El invitado vera solo la subtarea seleccionada y su contexto principal."
    : "El invitado vera la tarea completa y sus subtareas asociadas.";
}

function ensureViewerPermissions(task, scope = "task", subtask = null) {
  const viewerNames = scope === "subtask"
    ? splitList((subtask?.viewers || []).join(", "))
    : splitList((task.viewers || []).join(", "));
  if (!viewerNames.length) return;

  const now = new Date().toISOString();
  task.guestPermissions = task.guestPermissions || [];
  viewerNames.forEach((viewerName) => {
    const guest = guestDirectory.find((item) => item.name.toLowerCase() === viewerName.toLowerCase());
    if (!guest) return;
    const subtaskId = scope === "subtask" ? subtask?.id || "" : "";
    const existing = task.guestPermissions.find((permission) =>
      permission.guestId === guest.id &&
      permission.scope === scope &&
      (permission.subtaskId || "") === subtaskId
    );

    if (existing) {
      existing.guestName = guest.name;
      existing.status = existing.status === "suspended" ? "pending" : existing.status || "pending";
      existing.subtaskTitle = subtask?.title || existing.subtaskTitle || "";
      existing.updatedAt = now;
      return;
    }

    task.guestPermissions.push({
      id: createId(),
      guestId: guest.id,
      guestName: guest.name,
      scope,
      subtaskId,
      subtaskTitle: subtask?.title || "",
      status: "pending",
      createdAt: now,
      acceptedAt: "",
      sentAt: "",
      suspendedAt: "",
      lastViewedAt: "",
      viewCount: 0
    });
  });

  task.viewers = [...new Set([...(task.viewers || []), ...viewerNames])];
}

function savePermissionFromDialog() {
  const task = tasks.find((item) => item.id === permissionContext.taskId);
  if (!task) return;
  const guest = guestDirectory.find((item) => item.id === permissionFields.guest.value);
  if (!guest) return;

  const scope = permissionFields.scope.value;
  const subtaskId = scope === "subtask" ? permissionFields.subtask.value : "";
  if (scope === "subtask" && !subtaskId) {
    permissionFields.note.textContent = "Selecciona una subtarea para conceder permiso limitado.";
    return;
  }

  const subtask = subtaskId ? (task.subtasks || []).find((item) => item.id === subtaskId) : null;
  const existing = (task.guestPermissions || []).find((permission) =>
    permission.guestId === guest.id &&
    permission.scope === scope &&
    (permission.subtaskId || "") === subtaskId
  );
  const now = new Date().toISOString();

  if (existing) {
    existing.status = permissionFields.status.value;
    existing.guestName = guest.name;
    existing.subtaskTitle = subtask?.title || "";
    existing.updatedAt = now;
    existing.acceptedAt = existing.status === "accepted" ? (existing.acceptedAt || now) : existing.acceptedAt || "";
    existing.sentAt = existing.status === "sent" ? (existing.sentAt || now) : existing.sentAt || "";
    existing.suspendedAt = existing.status === "suspended" ? now : "";
    if (existing.status === "accepted") {
      existing.lastViewedAt = now;
      existing.viewCount = Number(existing.viewCount || 0) + 1;
    }
  } else {
    task.guestPermissions = task.guestPermissions || [];
    task.guestPermissions.push({
      id: createId(),
      guestId: guest.id,
      guestName: guest.name,
      scope,
      subtaskId,
      subtaskTitle: subtask?.title || "",
      status: permissionFields.status.value,
      createdAt: now,
      acceptedAt: permissionFields.status.value === "accepted" ? now : "",
      sentAt: permissionFields.status.value === "sent" ? now : "",
      suspendedAt: permissionFields.status.value === "suspended" ? now : "",
      lastViewedAt: permissionFields.status.value === "accepted" ? now : "",
      viewCount: permissionFields.status.value === "accepted" ? 1 : 0
    });
  }

  task.viewers = [...new Set([...(task.viewers || []), guest.name])];
  task.updatedAt = now;
  saveTasks();
  closePermissionDialog();
  render();
}

async function shareGuestPermission(task, permissionId) {
  const permission = task.guestPermissions?.find((item) => item.id === permissionId);
  if (!permission) return;
  trackEvent("guestWhatsappShares");
  const now = new Date().toISOString();

  const guest = guestDirectory.find((item) => item.id === permission.guestId);
  const subtask = permission.scope === "subtask"
    ? (task.subtasks || []).find((item) => item.id === permission.subtaskId)
    : null;
  const shared = {
    permissionId: permission.id,
    task: {
      id: task.id,
      title: task.title,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      description: permission.scope === "task"
        ? task.description
        : "Vista limitada: el invitado solo puede visualizar la subtarea autorizada.",
      subtasks: permission.scope === "task"
        ? (task.subtasks || [])
        : (task.subtasks || []).filter((subtask) => subtask.id === permission.subtaskId)
    },
    guest: {
      name: guest?.name || permission.guestName
    },
    sharedAt: now
  };
  let firebaseSent = false;
  if (guest?.email) {
    try {
      const invitationRef = await sendFirebaseInvitation({
        role: "viewer",
        scope: permission.scope || "task",
        recipientEmail: guest.email,
        recipientName: guest.name,
        taskId: task.id,
        subtaskId: permission.subtaskId || "",
        permissionId: permission.id,
        title: permission.scope === "subtask" ? (subtask?.title || task.title) : task.title,
        task: sanitizeTaskForInvitation(task, { includeSubtasks: permission.scope === "task" }),
        subtask: permission.scope === "subtask" ? sanitizeSubtaskForInvitation(subtask) : null,
        status: "pending"
      });
      if (invitationRef?.id) {
        permission.firebaseInvitationId = invitationRef.id;
        firebaseSent = true;
      }
    } catch (error) {
      console.error("No se pudo crear invitacion Firebase para visualizador.", error);
      alert("No se pudo crear la invitacion Firebase para el visualizador. Revisa conexion o reglas de Firestore.");
    }
  }
  const payload = encodePayload(shared);
  const taskUrl = `${getAppBaseUrl()}?acceptGuest=${encodeURIComponent(payload)}`;
  const message = `TRACKION AGENDA\n${guest?.name || permission.guestName}, te han invitado a visualizar una tarea: ${task.title}\nPermiso: ${permission.scope === "task" ? "tarea completa" : "subtarea concreta"}\n${firebaseSent ? "Tambien la tienes pendiente en tu bandeja de invitaciones TRACKION.\n" : ""}Abre y acepta:\n${taskUrl}`;
  const phone = guest?.phone?.replace(/\D/g, "");
  const whatsappUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener");
  permission.sentAt = now;
  permission.status = permission.status === "accepted" ? "accepted" : "sent";
  permission.inviteChannel = firebaseSent ? "firebase+whatsapp" : "whatsapp";
  task.updatedAt = now;
  saveTasks();
  render();
}

function updateGuestPermission(task, permissionId, status) {
  const permission = task.guestPermissions?.find((item) => item.id === permissionId);
  if (!permission) return;

  permission.status = status;
  if (status === "accepted") {
    const now = new Date().toISOString();
    permission.acceptedAt = permission.acceptedAt || now;
    permission.lastViewedAt = now;
    permission.viewCount = Number(permission.viewCount || 0) + 1;
  }
  if (status === "suspended") permission.suspendedAt = new Date().toISOString();
  task.updatedAt = new Date().toISOString();
  saveTasks();
  render();
}

function markAgentSubtaskAccepted(taskId, subtaskId) {
  const task = tasks.find((item) => item.id === taskId);
  const subtask = task?.subtasks?.find((item) => item.id === subtaskId);
  if (!task || !subtask) return;
  const now = new Date().toISOString();
  subtask.agentInviteStatus = "accepted";
  subtask.agentAcceptedAt = now;
  subtask.agentInviteSentAt = subtask.agentInviteSentAt || now;
  task.updatedAt = now;
  saveTasks();
  render();
}

function markTaskAgentAccepted(task) {
  if (!task?.agents?.length) return;
  const now = new Date().toISOString();
  task.agentInviteStatus = "accepted";
  task.agentAcceptedAt = now;
  task.agentInviteSentAt = task.agentInviteSentAt || now;
  task.updatedAt = now;
  saveTasks();
  render();
}

function renderTaskAgentAcceptedButton(task) {
  if (!task?.agents?.length) return "";
  return "<button class=\"small-button\" data-action=\"accept-task-agent\" type=\"button\">Marcar agente acepto</button>";
}

function deleteGuestPermission(task, permissionId) {
  if (!confirm("¿Seguro que quieres eliminar este permiso de visualizacion?")) return;
  task.guestPermissions = (task.guestPermissions || []).filter((permission) => permission.id !== permissionId);
  task.updatedAt = new Date().toISOString();
  saveTasks();
  render();
}

function deleteTask(task) {
  if (!confirm(`¿Seguro que quieres borrar la tarea "${task.title}" y sus subtareas?`)) return;
  tasks = tasks.filter((item) => item.id !== task.id);
  selectedId = tasks[0]?.id || null;
  saveTasks();
  render();
}

function resetFilters() {
  selectedSummaryView = "";
  highlightedFromGallery = { taskId: "", subtaskId: "" };
  filters.search.value = "";
  filters.status.value = "pending";
  filters.type.value = "all";
  filters.category.value = "all";
  filters.media.value = "all";
  filters.sort.value = "dueAsc";
  render();
}

function seedExampleData() {
  const now = new Date();
  const agentsPool = ["Pablo", "Marcos", "Carlos", "Ana", "Lucia", "Dario", "Marta", "Hector", "Sonia", "Ruben"];
  agentDirectory = agentsPool.map((name, index) => ({
    id: createId(),
    name,
    phone: `34600${String(111000 + index).padStart(6, "0")}`,
    email: `${name.toLowerCase()}@trackion.test`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }));
  saveAgents();
  const guestsPool = ["Cliente Norte", "Direccion", "Supervisor Externo", "Arquitecto", "Asesoria", "Propiedad"];
  guestDirectory = guestsPool.map((name, index) => ({
    id: createId(),
    name,
    phone: `34601${String(222000 + index).padStart(6, "0")}`,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@trackion.test`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }));
  saveGuests();
  refreshAgentSelectOptions();
  refreshViewerSelectOptions();
  const taskSeeds = [
    ["Pintar casa en Calle Legazpi", "Obra", "shared", "active", "alta", ["pintura", "legazpi", "obra"], 5],
    ["Reparar filtracion en local comercial", "Mantenimiento", "shared", "active", "urgente", ["agua", "local", "incidencia"], 2],
    ["Revision de finca norte", "Finca", "shared", "new", "media", ["finca", "riego", "cultivo"], 8],
    ["Preparar documentacion fiscal", "Administracion", "permanent", "paused", "urgente", ["fiscal", "documentos", "asesoria"], -1],
    ["Compra de materiales electricos", "Compras", "personal", "new", "media", ["compras", "electricidad"], 3],
    ["Instalacion de estanterias almacen", "Mantenimiento", "shared", "active", "alta", ["almacen", "montaje"], 6],
    ["Cita medica revision anual", "Medico", "personal", "new", "media", ["salud", "revision"], 12],
    ["Seguimiento expediente legal", "Legal", "permanent", "active", "alta", ["legal", "contrato"], 15],
    ["Limpieza profunda nave", "Empleados", "shared", "active", "media", ["nave", "limpieza"], 4],
    ["Inventario impresoras taller", "Administracion", "shared", "new", "baja", ["inventario", "impresoras"], 11],
    ["Reunion con proveedor de tintas", "Compras", "personal", "new", "alta", ["proveedor", "tintas"], 1],
    ["Reparar puerta garaje", "Mantenimiento", "shared", "paused", "alta", ["garaje", "puerta"], -2],
    ["Control riego parcela sur", "Finca", "shared", "active", "media", ["riego", "parcela"], 7],
    ["Organizar archivo contratos", "Administracion", "personal", "active", "baja", ["archivo", "contratos"], 20],
    ["Inspeccion seguridad oficina", "Incidencias", "shared", "new", "urgente", ["seguridad", "oficina"], 2],
    ["Montaje sala reuniones", "Obra", "shared", "active", "media", ["sala", "montaje"], 9],
    ["Renovar poliza seguro", "Administracion", "personal", "new", "alta", ["seguro", "poliza"], 14],
    ["Mantenimiento vehiculo empresa", "Mantenimiento", "personal", "active", "media", ["vehiculo", "revision"], 6],
    ["Seguimiento cliente Tenerife", "Otra", "permanent", "active", "alta", ["cliente", "tenerife"], 25],
    ["Resolver incidencia servidor", "Incidencias", "shared", "active", "urgente", ["servidor", "ionos", "web"], 1]
  ];

  tasks = taskSeeds.map((seed, index) => {
    const [title, category, type, status, priority, keywords, dueOffset] = seed;
    const assignedAgents = type === "personal"
      ? []
      : [agentsPool[index % agentsPool.length], agentsPool[(index + 3) % agentsPool.length], agentsPool[(index + 6) % agentsPool.length]];
    const progress = status === "done" ? 10 : Math.min(9, Math.max(0, (index * 3) % 10));
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - (index + 1));
    createdAt.setHours(8 + (index % 8), 10 + index, 0, 0);
    const updatedAt = new Date(createdAt);
    updatedAt.setDate(createdAt.getDate() + Math.min(index, 5));
    const lat = 28.08 + index * 0.013;
    const lng = -16.32 - index * 0.009;

    return {
      id: createId(),
      title,
      type,
      status,
      dueDate: addDays(dueOffset),
      reminder: index % 3 === 0 ? `${addDays(Math.max(0, Math.min(6, dueOffset)))}T09:00` : "",
      category,
      priority,
      keywords,
      agents: assignedAgents,
      viewers: type === "shared" ? ["Direccion", "Cliente"] : [],
      description: `Caso ficticio de prueba para ${title}. Incluye seguimiento operativo, evidencias, agentes, subtareas y avance para validar la aplicacion.`,
      progress,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      completedAt: status === "done" ? updatedAt.toISOString() : "",
      photos: buildFakePhotos(title, index, lat, lng),
      files: [],
      subtasks: buildFakeSubtasks(title, assignedAgents, index, lat, lng),
      guestPermissions: buildFakeGuestPermissions(type, index),
      history: [
        { at: createdAt.toISOString(), text: "Tarea ficticia creada para pruebas" },
        { at: updatedAt.toISOString(), text: "Actualizacion ficticia de avance y evidencias" }
      ]
    };
  });
  selectedId = tasks[0].id;
  saveTasks();
  render();
}

function buildFakeGuestPermissions(type, index) {
  if (type !== "shared" || !guestDirectory.length) return [];
  const guest = guestDirectory[index % guestDirectory.length];
  return [{
    id: createId(),
    guestId: guest.id,
    guestName: guest.name,
    scope: "task",
    status: index % 5 === 0 ? "suspended" : index % 3 === 0 ? "accepted" : "pending",
    createdAt: addDays(-index),
    acceptedAt: index % 3 === 0 ? new Date().toISOString() : "",
    suspendedAt: index % 5 === 0 ? new Date().toISOString() : ""
  }];
}

function buildFakeSubtasks(title, agents, index, lat, lng) {
  if (!agents.length) return [];
  const verbs = ["Revisar", "Ejecutar", "Fotografiar", "Informar", "Finalizar"];
  return agents.map((agent, agentIndex) => {
    const progress = Math.min(10, ((index + agentIndex) * 2 + 3) % 11);
    const status = index % 9 === 0 && agentIndex === 2
      ? "archived"
      : progress >= 9
        ? "done"
        : progress === 0
          ? "new"
          : progress > 6
            ? "active"
            : index % 5 === 0
              ? "paused"
              : "active";
    const agentNotes = buildFakeAgentNotes(agent, index, agentIndex, lat, lng);
    return {
      id: createId(),
      title: `${verbs[(index + agentIndex) % verbs.length]} fase ${agentIndex + 1} de ${title}`,
      agent,
      agents: [agent],
      status,
      progress,
      dueDate: addDays(index + agentIndex + 2),
      reminder: "",
      createdAt: addDays(-index - agentIndex),
      updatedAt: new Date().toISOString(),
      priority: "media",
      keywords: [],
      viewers: [],
      description: "Subtarea ficticia con control de avance, entrada y salida.",
      photos: [],
      files: [],
      agentNotes,
      needsReview: (index % 4 === 0 && agentIndex === 0) || agentNotes.some(isUnreadAgentText),
      checkIn: `${String(8 + agentIndex).padStart(2, "0")}:${String(10 + index).padStart(2, "0")}`,
      checkOut: `${String(13 + agentIndex).padStart(2, "0")}:${String(25 + index).padStart(2, "0")}`,
      note: "Subtarea ficticia con control de avance, entrada y salida."
    };
  });
}

function buildFakeAgentNotes(agent, index, agentIndex, lat, lng) {
  if ((index + agentIndex) % 3 !== 0) return [];
  const date = new Date();
  date.setDate(date.getDate() - agentIndex);
  date.setHours(10 + agentIndex, 18 + index, 0, 0);
  return [{
    id: createId(),
    text: `Avance registrado por ${agent}: material revisado y pendiente de confirmar siguiente paso.`,
    agent,
    gps: `${(lat + agentIndex * 0.001).toFixed(5)}, ${(lng - agentIndex * 0.001).toFixed(5)}`,
    addedAt: date.toISOString(),
    requiresOwnerReview: true,
    reviewedAt: ""
  }];
}

function buildFakePhotos(title, index, lat, lng) {
  const firstDate = new Date();
  firstDate.setDate(firstDate.getDate() - index);
  firstDate.setHours(9 + (index % 5), 12 + index, 0, 0);
  const secondDate = new Date(firstDate);
  secondDate.setHours(firstDate.getHours() + 3, firstDate.getMinutes() + 7, 0, 0);

  return [
    {
      id: createId(),
      dataUrl: makeFakePhoto(title, "Entrada", "#176f68", index),
      name: "entrada.svg",
      type: "image/svg+xml",
      size: 4200,
      source: "app",
      gps: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      addedAt: firstDate.toISOString()
    },
    {
      id: createId(),
      dataUrl: makeFakePhoto(title, index % 2 ? "Fototeca" : "Avance", index % 2 ? "#315f8f" : "#c47b1f", index + 30),
      name: "avance.svg",
      type: "image/svg+xml",
      size: 4200,
      source: index % 2 ? "library" : "app",
      gps: index % 2 ? "GPS no disponible - FOTOTECA" : `${(lat + 0.002).toFixed(5)}, ${(lng - 0.002).toFixed(5)}`,
      addedAt: secondDate.toISOString()
    }
  ];
}

function makeFakePhoto(title, label, color, index) {
  const safeTitle = title.slice(0, 34);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <rect width="640" height="420" fill="#fffdf8"/>
      <rect x="0" y="0" width="640" height="86" fill="${color}"/>
      <text x="32" y="54" font-family="Arial" font-size="30" font-weight="700" fill="#ffffff">${escapeHtml(label)}</text>
      <rect x="38" y="128" width="564" height="216" rx="18" fill="#e4f1ed"/>
      <path d="M80 302 L206 205 L302 274 L394 182 L562 304" fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="492" cy="172" r="36" fill="#c47b1f"/>
      <text x="42" y="386" font-family="Arial" font-size="23" font-weight="700" fill="#182322">${escapeHtml(safeTitle)}</text>
      <text x="520" y="386" font-family="Arial" font-size="20" fill="#63706d">#${index}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function readDataUrl(file) {
  if (!file) return Promise.resolve(null);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

async function stampCaptureMetadataOnImage(dataUrl, mimeType, capturedAt, gps) {
  if (!dataUrl) return dataUrl;
  try {
    const image = await loadImageFromDataUrl(dataUrl);
    const maxSide = 2200;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;

    context.drawImage(image, 0, 0, width, height);
    drawCaptureStamp(context, width, height, capturedAt, gps);

    const outputType = mimeType === "image/png" || mimeType === "image/webp" ? mimeType : "image/jpeg";
    return canvas.toDataURL(outputType, outputType === "image/jpeg" ? 0.9 : undefined);
  } catch {
    return dataUrl;
  }
}

function drawCaptureStamp(context, width, height, capturedAt, gps) {
  const padding = Math.max(14, Math.round(width * 0.018));
  const titleSize = Math.max(18, Math.round(width * 0.024));
  const textSize = Math.max(16, Math.round(width * 0.019));
  const lineGap = Math.round(textSize * 1.45);
  const bandHeight = padding * 2 + titleSize + lineGap * 2;
  const top = Math.max(0, height - bandHeight);
  const stampLines = [
    "TRACKION AGENDA",
    `Fecha y hora: ${formatDateTime(capturedAt)}`,
    `GPS: ${gps || "no autorizado / no indicado"}`
  ];

  context.save();
  context.fillStyle = "rgba(0, 0, 0, 0.68)";
  context.fillRect(0, top, width, bandHeight);
  context.fillStyle = "#ffffff";
  context.textBaseline = "top";
  context.shadowColor = "rgba(0, 0, 0, 0.75)";
  context.shadowBlur = 3;
  context.font = `900 ${titleSize}px Arial, Helvetica, sans-serif`;
  context.fillText(stampLines[0], padding, top + padding);
  context.font = `700 ${textSize}px Arial, Helvetica, sans-serif`;
  context.fillText(stampLines[1], padding, top + padding + titleSize + Math.round(textSize * 0.45));
  context.fillText(stampLines[2], padding, top + padding + titleSize + Math.round(textSize * 0.45) + lineGap);
  context.restore();
}

async function readMediaFiles(files, gps, options = {}) {
  const now = new Date().toISOString();
  const sourceMode = options.sourceMode || fields.photoSource.value;
  const requiresOwnerReview = options.requiresOwnerReview ?? (dialogMode === "subtask");
  const allowed = files.filter((file) => {
    if (sourceMode === "app") return file.type.startsWith("image/") || file.type.startsWith("video/");
    if (sourceMode === "microphone") return file.type.startsWith("audio/");
    return file.type.startsWith("image/") || file.type.startsWith("video/") || file.type.startsWith("audio/");
  });
  const entries = await Promise.all(allowed.map(async (file) => {
    const originalDataUrl = await readDataUrl(file);
    const isCameraPhoto = sourceMode === "app" && file.type.startsWith("image/");
    const dataUrl = isCameraPhoto
      ? await stampCaptureMetadataOnImage(originalDataUrl, file.type, now, gps)
      : originalDataUrl;
    return {
      id: createId(),
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl,
      source: sourceMode,
      gps,
      capturedAt: now,
      stamped: isCameraPhoto,
      uploadedByRole: requiresOwnerReview ? "agent" : "owner",
      requiresOwnerReview,
      reviewedAt: requiresOwnerReview ? "" : now,
      addedAt: now
    };
  }));
  return entries.filter((entry) => entry.dataUrl);
}

async function readStoredFiles(files, options = {}) {
  const now = new Date().toISOString();
  const requiresOwnerReview = options.requiresOwnerReview ?? (dialogMode === "subtask");
  const entries = await Promise.all(files.map(async (file) => ({
    id: createId(),
    name: file.name,
    type: file.type,
    size: file.size,
    dataUrl: await readDataUrl(file),
    uploadedByRole: requiresOwnerReview ? "agent" : "owner",
    requiresOwnerReview,
    reviewedAt: requiresOwnerReview ? "" : now,
    addedAt: now
  })));
  return entries.filter((entry) => entry.dataUrl);
}

function getCurrentGpsIfCamera(sourceMode = fields.photoSource.value) {
  if (sourceMode !== "app" || !navigator.geolocation) return Promise.resolve("");
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`),
      () => resolve(""),
      { enableHighAccuracy: true, timeout: 4000, maximumAge: 60000 }
    );
  });
}

function getAttachmentValidation() {
  const selected = [...Array.from(fields.photo.files || []), ...Array.from(fields.files.files || [])];
  if (!selected.length) return { ok: true, message: "" };

  const tooLarge = selected.find((file) => file.size > MAX_LOCAL_ATTACHMENT_BYTES);
  if (tooLarge) {
    return {
      ok: false,
      message: `${tooLarge.name} pesa ${formatBytes(tooLarge.size)}. En modo local el maximo recomendado es ${formatBytes(MAX_LOCAL_ATTACHMENT_BYTES)} por archivo.`
    };
  }

  const total = selected.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_LOCAL_BATCH_BYTES) {
    return {
      ok: false,
      message: `La carga seleccionada suma ${formatBytes(total)}. En modo local el maximo recomendado es ${formatBytes(MAX_LOCAL_BATCH_BYTES)} por guardado.`
    };
  }

  return { ok: true, message: `${selected.length} archivo(s) seleccionados - ${formatBytes(total)}.` };
}

function updateAttachmentStatus() {
  if (!fields.attachmentStatus) return;
  const validation = getAttachmentValidation();
  showAttachmentStatus(validation.message, !validation.ok);
}

function showAttachmentStatus(message, isWarning = false) {
  if (!fields.attachmentStatus) return;
  fields.attachmentStatus.textContent = message;
  fields.attachmentStatus.classList.toggle("warning", Boolean(isWarning));
}

function exportLocalData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "TRACKION AGENDA",
    version: 1,
    tasks,
    agents: agentDirectory,
    guests: guestDirectory,
    settings: userSettings,
    analytics
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `trackion-agenda-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importLocalData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      if (!Array.isArray(payload.tasks)) throw new Error("Archivo no valido");
      tasks = payload.tasks;
      agentDirectory = Array.isArray(payload.agents) ? payload.agents : agentDirectory;
      guestDirectory = Array.isArray(payload.guests) ? payload.guests : guestDirectory;
      userSettings = payload.settings || userSettings;
      analytics = payload.analytics || analytics;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      saveAgents();
      saveGuests();
      saveUserSettings();
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
      refreshAgentSelectOptions();
      refreshViewerSelectOptions();
      selectedId = tasks[0]?.id || null;
      selectedSummaryView = "";
      closeConfigDialog();
      render();
    } catch {
      configFields.localStorageStatus.textContent = "No se pudo importar: el archivo no parece un respaldo valido de TRACKION.";
    } finally {
      configFields.importDataInput.value = "";
    }
  };
  reader.readAsText(file);
}

function renderLocalStorageStatus() {
  if (!configFields.localStorageStatus) return;
  const bytes = new Blob([
    localStorage.getItem(STORAGE_KEY) || "",
    localStorage.getItem(AGENTS_KEY) || "",
    localStorage.getItem(GUESTS_KEY) || "",
    localStorage.getItem(USER_SETTINGS_KEY) || ""
  ]).size;
  configFields.localStorageStatus.textContent = `Uso local aproximado: ${formatBytes(bytes)}. Para comercializacion, los archivos pesados deben ir a Google Drive o Storage por usuario.`;
}

function renderWhatsappReminderStatus() {
  const reminders = getWhatsappReminderItems();
  const endpoint = window.AGENDA_CONFIG?.whatsappReminderEndpoint || "";
  if (configFields.whatsappReminderStatus) {
    configFields.whatsappReminderStatus.textContent = `${reminders.length} aviso(s) 48h/24h pendientes o proximos. ${userSettings.autoWhatsapp ? "Automatizacion activada en CONFIG." : "Automatizacion desactivada."}`;
  }
  if (configFields.whatsappEndpointStatus) {
    configFields.whatsappEndpointStatus.textContent = endpoint
      ? `Endpoint configurado: ${endpoint}`
      : "Endpoint no configurado: se mostrara la cola de avisos, pero no se enviaran automaticamente.";
  }
}

function getWhatsappReminderItems() {
  const now = new Date();
  const windows = [48, 24];
  const items = [];

  tasks.forEach((task) => {
    if (task.status === "done" || task.status === "archived") return;
    const taskDue = getDueDateTime(task.dueDate);
    if (taskDue) {
      windows.forEach((hours) => {
        if (isReminderWindow(now, taskDue, hours)) {
          getTaskReminderRecipients(task).forEach((recipient) => {
            items.push(buildReminderItem(task, null, recipient, hours, taskDue));
          });
        }
      });
    }

    (task.subtasks || []).forEach((subtask) => {
      if (subtask.status === "done" || subtask.status === "archived") return;
      const subtaskDue = getDueDateTime(subtask.dueDate || task.dueDate);
      if (!subtaskDue) return;
      windows.forEach((hours) => {
        if (isReminderWindow(now, subtaskDue, hours)) {
          getSubtaskReminderRecipients(task, subtask).forEach((recipient) => {
            items.push(buildReminderItem(task, subtask, recipient, hours, subtaskDue));
          });
        }
      });
    });
  });

  return items.filter((item) => !whatsappReminderState.sent[item.id]);
}

function getDueDateTime(dateKey) {
  if (!dateKey) return null;
  return new Date(`${dateKey}T09:00:00`);
}

function isReminderWindow(now, due, hours) {
  const diffHours = (due.getTime() - now.getTime()) / 3600000;
  return diffHours > hours - 1 && diffHours <= hours;
}

function getTaskReminderRecipients(task) {
  const recipients = [];
  if (task.agents?.length) {
    task.agents.forEach((agentName) => {
      const agent = agentDirectory.find((item) => item.name.toLowerCase() === agentName.toLowerCase());
      recipients.push({ role: "agent", name: agentName, phone: agent?.phone || "" });
    });
  } else if (userSettings.ownerPhone) {
    recipients.push({ role: "owner", name: "Propietario", phone: userSettings.ownerPhone });
  }

  (task.guestPermissions || [])
    .filter((permission) => permission.status !== "suspended" && permission.scope === "task")
    .forEach((permission) => {
      const guest = guestDirectory.find((item) => item.id === permission.guestId);
      recipients.push({ role: "guest", name: guest?.name || permission.guestName || "Invitado", phone: guest?.phone || "" });
    });

  return recipients;
}

function getSubtaskReminderRecipients(task, subtask) {
  const recipients = [];
  const agentName = subtask.agent || (subtask.agents || [])[0] || "";
  if (agentName) {
    const agent = agentDirectory.find((item) => item.name.toLowerCase() === agentName.toLowerCase());
    recipients.push({ role: "agent", name: agentName, phone: agent?.phone || "" });
  } else if (userSettings.ownerPhone) {
    recipients.push({ role: "owner", name: "Propietario", phone: userSettings.ownerPhone });
  }

  (task.guestPermissions || [])
    .filter((permission) => permission.status !== "suspended" && (permission.scope === "task" || permission.subtaskId === subtask.id))
    .forEach((permission) => {
      const guest = guestDirectory.find((item) => item.id === permission.guestId);
      recipients.push({ role: "guest", name: guest?.name || permission.guestName || "Invitado", phone: guest?.phone || "" });
    });

  return recipients;
}

function buildReminderItem(task, subtask, recipient, hours, dueDate) {
  const subject = subtask || task;
  const id = `${task.id}:${subtask?.id || "task"}:${recipient.role}:${recipient.phone || recipient.name}:${hours}`;
  const agentText = subtask ? ` Agente asignado: ${subtask.agent || "sin agente"}.` : "";
  return {
    id,
    taskId: task.id,
    subtaskId: subtask?.id || "",
    recipient,
    hours,
    dueAt: dueDate.toISOString(),
    message: `TRACKION AGENDA: quedan ${hours} horas para el vencimiento de "${subject.title || task.title}" dentro de "${task.title}".${agentText}`
  };
}

async function processWhatsappReminders() {
  if (!userSettings.autoWhatsapp) return;
  const endpoint = window.AGENDA_CONFIG?.whatsappReminderEndpoint;
  if (!endpoint) return;

  const reminders = getWhatsappReminderItems().filter((item) => item.recipient.phone);
  for (const reminder of reminders) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reminder)
      });
      if (!response.ok) throw new Error("No enviado");
      whatsappReminderState.sent[reminder.id] = new Date().toISOString();
      localStorage.setItem(WHATSAPP_REMINDER_KEY, JSON.stringify(whatsappReminderState));
    } catch (error) {
      console.warn("Aviso WhatsApp pendiente de backend/proveedor.", error);
    }
  }
}

function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function isOverdue(task) {
  return task.status !== "done" && task.dueDate && task.dueDate < todayKey();
}

function isDueSoon(task) {
  if (task.status === "done" || !task.dueDate) return false;
  const today = new Date(`${todayKey()}T00:00:00`);
  const due = new Date(`${task.dueDate}T00:00:00`);
  const days = Math.ceil((due - today) / 86400000);
  return days >= 0 && days <= 10;
}

function buildMeta(task) {
  const due = task.dueDate ? `Prevista: ${formatDate(task.dueDate)}` : "Sin fecha prevista";
  const media = task.photos.length ? ` · ${task.photos.length} foto(s)` : "";
  return `${typeLabels[task.type]} · ${statusLabels[task.status]} · ${due}${media}`;
}

function buildTaskMeta(task) {
  if (isReceivedAgentTask(task)) {
    const owner = getSharedOwnerLabel(task);
    const instructions = getReceivedInstructionSnippet(task);
    return `Orden: ${owner}${instructions ? ` - ${instructions}` : ""}`;
  }
  if (isReceivedViewerTask(task)) {
    const owner = getSharedOwnerLabel(task);
    const instructions = getReceivedInstructionSnippet(task);
    return `Visualizacion: ${owner}${instructions ? ` - ${instructions}` : ""}`;
  }
  const due = task.dueDate ? `Prevista: ${formatDate(task.dueDate)}` : "Sin fecha prevista";
  const media = getTaskMediaCount(task) ? ` - ${getTaskMediaCount(task)} media` : "";
  const files = getTaskFileCount(task) ? ` - ${getTaskFileCount(task)} archivo(s)` : "";
  return `${typeLabels[task.type]} - ${statusLabels[task.status]} - ${due}${media}${files}`;
}

function getSharedOwnerLabel(task) {
  const email = normalizeEmail(task.sharedOwnerEmail || task.ownerEmail || "");
  const person = email
    ? [...agentDirectory, ...guestDirectory].find((item) => personMatchesEmailAlias(item, email))
    : null;
  if (person?.name) return person.name;
  if (task.sharedOwnerName || task.ownerName) return task.sharedOwnerName || task.ownerName;
  return task.sharedOwnerEmail || task.ownerEmail || "propietario";
}

function personMatchesEmailAlias(person, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!person || !normalizedEmail) return false;
  if (normalizeEmail(person.email) === normalizedEmail) return true;

  const localPart = normalizedEmail.split("@")[0].replace(/[^a-z0-9]/g, "");
  const nameParts = String(person.name || "")
    .split(/\s+/)
    .map((part) => normalizeCompareText(part).replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
  if (!localPart || nameParts.length < 2) return false;

  const compactName = nameParts.join("");
  const firstInitialLast = `${nameParts[0][0] || ""}${nameParts[nameParts.length - 1]}`;
  return localPart.startsWith(firstInitialLast) || localPart.startsWith(compactName);
}

function getReceivedInstructionSnippet(task) {
  const subtaskText = (task.subtasks || [])
    .map((subtask) => subtask.description || subtask.instructions || "")
    .find((text) => String(text || "").trim());
  const text = String(task.description || subtaskText || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > 86 ? `${text.slice(0, 83)}...` : text;
}

function formatReceivedDate(task) {
  const value = task.acceptedAt || task.agentAcceptedAt || task.createdAt || task.sharedAt || "";
  return value ? new Date(value).toLocaleDateString("es-ES") : "sin fecha";
}

function getTaskMediaCount(task) {
  return (task.photos?.length || 0) + (task.subtasks || []).reduce((count, subtask) => count + (subtask.photos?.length || 0), 0);
}

function getTaskFileCount(task) {
  return (task.files?.length || 0) + (task.subtasks || []).reduce((count, subtask) => count + (subtask.files?.length || 0), 0);
}

function hasUnreadUploads(task) {
  return Boolean(
    (task.photos || []).some(isUnreadEvidence) ||
    (task.files || []).some(isUnreadEvidence) ||
    (task.subtasks || []).some(hasUnreadSubtaskUploads)
  );
}

function hasUnreadSubtaskUploads(subtask) {
  return Boolean(
    subtask?.needsReview ||
    hasUnreadSubtaskEvidence(subtask)
  );
}

function hasUnreadSubtaskEvidence(subtask) {
  return Boolean(
    (subtask?.photos || []).some(isUnreadEvidence) ||
    (subtask?.files || []).some(isUnreadEvidence) ||
    (subtask?.agentNotes || []).some(isUnreadAgentText)
  );
}

function getUnreadEvidenceCount(task) {
  const ownUnread = [...(task.photos || []), ...(task.files || [])].filter(isUnreadEvidence).length;
  const subtaskUnread = (task.subtasks || []).reduce((total, subtask) =>
    total + [...(subtask.photos || []), ...(subtask.files || [])].filter(isUnreadEvidence).length,
  0);
  return ownUnread + subtaskUnread;
}

function isUnreadEvidence(item) {
  return Boolean(item?.requiresOwnerReview && !item.reviewedAt);
}

function isUnreadAgentText(item) {
  return Boolean(item?.requiresOwnerReview && !item.reviewedAt);
}

function markTaskTextReviewed(task) {
  let changed = false;
  (task.subtasks || []).forEach((subtask) => {
    if (markSubtaskTextReviewed(subtask)) changed = true;
  });
  return changed;
}

function markSubtaskTextReviewed(subtask) {
  let changed = false;
  (subtask?.agentNotes || []).forEach((note) => {
    if (isUnreadAgentText(note)) {
      note.reviewedAt = new Date().toISOString();
      changed = true;
    }
  });
  if (subtask) subtask.needsReview = hasUnreadSubtaskEvidence(subtask);
  return changed;
}

function normalizeReviewState() {
  let changed = false;
  tasks.forEach((task) => {
    (task.subtasks || []).forEach((subtask) => {
      if (subtask.needsReview) {
        [...(subtask.photos || []), ...(subtask.files || [])].forEach((item) => {
          if (item.requiresOwnerReview === undefined && !item.reviewedAt) {
            item.requiresOwnerReview = true;
            item.uploadedByRole = item.uploadedByRole || "agent";
            changed = true;
          }
        });
      }
      const nextNeedsReview = hasUnreadSubtaskEvidence(subtask);
      if (subtask.needsReview !== nextNeedsReview) {
        subtask.needsReview = nextNeedsReview;
        changed = true;
      }
    });
  });
  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getSubtaskPermissions(task, subtaskId) {
  return (task.guestPermissions || []).filter((permission) => permission.scope === "subtask" && permission.subtaskId === subtaskId);
}

function getAllSubtaskAssignments() {
  return tasks.flatMap((task) => (task.subtasks || []).map((subtask) => ({ task, subtask })));
}

function getFilteredSubtaskAssignments(viewName) {
  const rows = getAllSubtaskAssignments();
  if (viewName === "subtasks-pending") {
    return rows.filter((item) => item.subtask.status !== "done" && item.subtask.status !== "archived");
  }
  if (viewName === "subtasks-done") {
    return rows.filter((item) => item.subtask.status === "done" || item.subtask.status === "archived");
  }
  if (viewName === "subtasks-overdue") {
    return rows.filter((item) => isSubtaskOverdue(item.task, item.subtask));
  }
  return rows;
}

function isSubtaskOverdue(task, subtask) {
  const dueDate = subtask.dueDate || task.dueDate;
  return subtask.status !== "done" && subtask.status !== "archived" && dueDate && dueDate < todayKey();
}

function formatDaysUntil(dateKey) {
  if (!dateKey) return "Sin vencimiento";
  const today = new Date(`${todayKey()}T00:00:00`);
  const due = new Date(`${dateKey}T00:00:00`);
  const days = Math.ceil((due - today) / 86400000);
  if (days < 0) return `${Math.abs(days)} dia(s) vencida`;
  if (days === 0) return "Vence hoy";
  return `${days} dia(s) pendientes`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function deleteStoredMedia(task, mediaId, scope, subtaskId) {
  if (!confirm("¿Seguro que quieres eliminar esta evidencia?")) return;
  if (scope === "subtask") {
    const subtask = task.subtasks?.find((item) => item.id === subtaskId);
    if (subtask) subtask.photos = (subtask.photos || []).filter((media) => media.id !== mediaId);
  } else {
    task.photos = (task.photos || []).filter((media) => media.id !== mediaId);
  }
  task.updatedAt = new Date().toISOString();
  saveTasks();
  render();
}

function deleteStoredFile(task, fileId, scope, subtaskId) {
  if (!confirm("¿Seguro que quieres eliminar este archivo?")) return;
  if (scope === "subtask") {
    const subtask = task.subtasks?.find((item) => item.id === subtaskId);
    if (subtask) subtask.files = (subtask.files || []).filter((file) => file.id !== fileId);
  } else {
    task.files = (task.files || []).filter((file) => file.id !== fileId);
  }
  task.updatedAt = new Date().toISOString();
  saveTasks();
  render();
}

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function loadAgents() {
  try {
    return JSON.parse(localStorage.getItem(AGENTS_KEY)) || [];
  } catch {
    return [];
  }
}

function loadGuests() {
  try {
    return JSON.parse(localStorage.getItem(GUESTS_KEY)) || [];
  } catch {
    return [];
  }
}

function loadUserSettings() {
  const defaults = { ownerPhone: "", storagePreference: "local", autoWhatsapp: false };
  try {
    return { ...defaults, ...(JSON.parse(localStorage.getItem(USER_SETTINGS_KEY)) || {}) };
  } catch {
    return defaults;
  }
}

function loadWhatsappReminderState() {
  try {
    return JSON.parse(localStorage.getItem(WHATSAPP_REMINDER_KEY)) || { sent: {} };
  } catch {
    return { sent: {} };
  }
}

function saveAgents() {
  localStorage.setItem(AGENTS_KEY, JSON.stringify(agentDirectory));
  saveAgendaToCloud();
}

function saveGuests() {
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guestDirectory));
  saveAgendaToCloud();
}

function saveUserSettings() {
  localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(userSettings));
  saveAgendaToCloud();
}

function loadAnalytics() {
  const defaults = {
    opens: 0,
    tasksCreated: 0,
    galleryOpens: 0,
    appWhatsappShares: 0,
    appEmailShares: 0,
    appSmsShares: 0,
    taskWhatsappShares: 0,
    subtaskWhatsappShares: 0,
    guestWhatsappShares: 0
  };
  try {
    return { ...defaults, ...(JSON.parse(localStorage.getItem(ANALYTICS_KEY)) || {}) };
  } catch {
    return defaults;
  }
}

function trackEvent(key) {
  analytics[key] = (analytics[key] || 0) + 1;
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
}

function permissionStatusLabel(status) {
  if (status === "accepted") return "Aceptado";
  if (status === "sent") return "Enviado";
  if (status === "suspended") return "Suspendido";
  return "Pendiente";
}

function agentInviteStatusLabel(subtask) {
  if (subtask?.agentInviteStatus === "accepted") {
    return subtask.agentAcceptedAt ? `Aceptada ${formatDateTime(subtask.agentAcceptedAt)}` : "Aceptada";
  }
  if (subtask?.agentInviteStatus === "sent") {
    return subtask.agentInviteSentAt ? `Enviada ${formatDateTime(subtask.agentInviteSentAt)}` : "Enviada";
  }
  return "Pendiente de enviar";
}

function readSharedTaskFromUrl() {
  const params = new URLSearchParams(location.search);
  const payload = params.get("import");
  if (!payload) return null;

  try {
    const task = decodePayload(payload);
    const now = new Date().toISOString();
    return {
      ...task,
      id: createId(),
      sharedInvitationId: task.sharedInvitationId || "",
      sharedOwnerUid: task.sharedOwnerUid || "",
      sharedOwnerEmail: task.sharedOwnerEmail || "",
      sharedRole: task.sharedRole || "agent",
      sharedSourceTaskId: task.sharedSourceTaskId || task.id || "",
      status: task.status === "done" ? "new" : task.status,
      createdAt: now,
      updatedAt: now,
      photos: [],
      files: [],
      history: [
        ...(task.history || []),
        { at: now, text: "Tarea incorporada desde enlace compartido" }
      ]
    };
  } catch {
    return null;
  }
}

function readAcceptedSubtaskFromUrl() {
  const params = new URLSearchParams(location.search);
  const payload = params.get("acceptSubtask");
  if (!payload) return null;

  try {
    const shared = decodePayload(payload);
    const now = new Date().toISOString();
    const subtask = shared.subtask;
    const parentId = createId();
    return {
      id: parentId,
      sharedInvitationId: shared.sharedInvitationId || "",
      sharedOwnerUid: shared.sharedOwnerUid || "",
      sharedOwnerEmail: shared.sharedOwnerEmail || "",
      sharedRole: shared.sharedRole || "agent",
      sharedSourceTaskId: shared.task.id || "",
      title: shared.task.title,
      type: "shared",
      status: "new",
      dueDate: shared.task.dueDate || "",
      reminder: "",
      category: shared.task.category || "Otra",
      priority: shared.task.priority || "media",
      keywords: shared.task.keywords || subtask.keywords || [],
      agents: [subtask.agent],
      viewers: [],
      description: `${shared.task.description}\n\nSubtarea aceptada: ${subtask.title}\n\nInstrucciones: ${subtask.instructions || ""}`,
      progress: Number(subtask.progress || 0),
      createdAt: now,
      updatedAt: now,
      completedAt: "",
      photos: [],
      subtasks: [{
        ...subtask,
        id: createId(),
        parentTaskId: parentId,
        sharedInvitationId: shared.sharedInvitationId || "",
        sharedSourceSubtaskId: subtask.sharedSourceSubtaskId || subtask.id || "",
        status: "new",
        progress: Number(subtask.progress || 0)
      }],
      history: [{ at: now, text: "Subtarea incorporada desde invitacion WhatsApp" }]
    };
  } catch {
    return null;
  }
}

function readAcceptedGuestViewFromUrl() {
  const params = new URLSearchParams(location.search);
  const payload = params.get("acceptGuest");
  if (!payload) return null;

  try {
    const shared = decodePayload(payload);
    const now = new Date().toISOString();
    return {
      id: createId(),
      title: `Vista invitado: ${shared.task.title}`,
      type: "shared",
      status: "new",
      dueDate: shared.task.dueDate || "",
      reminder: "",
      category: shared.task.category || "Otra",
      priority: shared.task.priority || "media",
      keywords: ["invitado", "visualizacion"],
      agents: [],
      viewers: [shared.guest?.name || "Invitado"],
      description: `Vista solo lectura aceptada por invitado.\n\n${shared.task.description || ""}`,
      progress: 0,
      createdAt: now,
      updatedAt: now,
      completedAt: "",
      photos: [],
      subtasks: shared.task.subtasks || [],
      guestPermissions: [{
        id: createId(),
        guestId: "",
        guestName: shared.guest?.name || "Invitado",
        scope: "task",
        status: "accepted",
        createdAt: now,
        acceptedAt: now,
        lastViewedAt: now,
        viewCount: 1,
        suspendedAt: ""
      }],
      history: [{ at: now, text: "Vista de invitado incorporada desde invitacion" }]
    };
  } catch {
    return null;
  }
}

function clearImportFromUrl() {
  const cleanUrl = `${location.origin}${location.pathname}`;
  history.replaceState({}, "", cleanUrl);
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  processWhatsappReminders();
  saveAgendaToCloud();
}

function getAgendaPayload() {
  return {
    tasks,
    agents: agentDirectory,
    guests: guestDirectory,
    userSettings
  };
}

function persistAgendaLocally() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  localStorage.setItem(AGENTS_KEY, JSON.stringify(agentDirectory));
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guestDirectory));
  localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(userSettings));
}

async function saveAgendaToCloud() {
  if (cloudStore?.mode !== "firebase") return;
  const syncStatus = document.querySelector("#syncStatus");
  if (syncStatus) syncStatus.textContent = "Sincronizando";
  try {
    if (typeof cloudStore.saveAgenda === "function") {
      await cloudStore.saveAgenda(getAgendaPayload());
      lastRemoteSignature = JSON.stringify(getAgendaPayload());
    } else {
      await cloudStore.save(tasks);
      lastRemoteSignature = JSON.stringify(tasks);
    }
    syncOwnerInstructionUpdatesToInvitations();
    const nextSyncStatus = document.querySelector("#syncStatus");
    if (nextSyncStatus) nextSyncStatus.textContent = cloudStore.getUser()?.email || "Nube";
  } catch (error) {
    console.error("No se pudo sincronizar con Firebase.", error);
    const nextSyncStatus = document.querySelector("#syncStatus");
    if (nextSyncStatus) nextSyncStatus.textContent = "Error nube";
  }
}

function mergeTasks(localTasks, remoteTasks) {
  const map = new Map();
  [...remoteTasks, ...localTasks].forEach((task) => {
    const existing = map.get(task.id);
    if (!existing || (task.updatedAt || task.createdAt) > (existing.updatedAt || existing.createdAt)) {
      map.set(task.id, task);
    }
  });
  return [...map.values()].sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

function rebuildDirectoriesFromTasks() {
  let changed = false;
  const now = new Date().toISOString();
  const agentNames = new Set();
  const guestItems = new Map();

  tasks.forEach((task) => {
    if (isReceivedAgentTask(task) || isReceivedViewerTask(task)) return;

    (task.agents || []).forEach((name) => {
      const cleanName = String(name || "").trim();
      if (cleanName) agentNames.add(cleanName);
    });
    (task.subtasks || []).forEach((subtask) => {
      [subtask.agent, ...(subtask.agents || [])].forEach((name) => {
        const cleanName = String(name || "").trim();
        if (cleanName && cleanName.toLowerCase() !== "sin agente") agentNames.add(cleanName);
      });
    });
    (task.viewers || []).forEach((name) => {
      const cleanName = String(name || "").trim();
      if (cleanName) guestItems.set(cleanName.toLowerCase(), { name: cleanName });
    });
    (task.guestPermissions || []).forEach((permission) => {
      const cleanName = String(permission.guestName || "").trim();
      if (!cleanName) return;
      guestItems.set(permission.guestId || cleanName.toLowerCase(), {
        id: permission.guestId || "",
        name: cleanName,
        lastViewedAt: permission.lastViewedAt || permission.acceptedAt || ""
      });
    });
  });

  const beforeAgentCount = agentDirectory.length;
  agentDirectory = agentDirectory.filter((agent) => {
    if (agent.source !== "task-sync") return true;
    return agentNames.has(String(agent.name || "").trim());
  });
  if (agentDirectory.length !== beforeAgentCount) changed = true;

  const beforeGuestCount = guestDirectory.length;
  guestDirectory = guestDirectory.filter((guest) => {
    if (guest.source !== "task-sync") return true;
    return guestItems.has(guest.id || String(guest.name || "").trim().toLowerCase());
  });
  if (guestDirectory.length !== beforeGuestCount) changed = true;

  agentNames.forEach((name) => {
    const exists = agentDirectory.some((agent) => agent.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      agentDirectory.push({
        id: createId(),
        name,
        phone: "",
        email: "",
        source: "task-sync",
        createdAt: now,
        updatedAt: now
      });
      changed = true;
    }
  });

  guestItems.forEach((guest) => {
    const exists = guestDirectory.some((item) =>
      (guest.id && item.id === guest.id) ||
      item.name.toLowerCase() === guest.name.toLowerCase()
    );
    if (!exists) {
      guestDirectory.push({
        id: guest.id || createId(),
        name: guest.name,
        phone: "",
        email: "",
        source: "task-sync",
        createdAt: now,
        updatedAt: now,
        lastConnectionAt: guest.lastViewedAt || ""
      });
      changed = true;
    }
  });

  if (changed) {
    agentDirectory = mergePeopleDirectory([], agentDirectory);
    guestDirectory = mergePeopleDirectory([], guestDirectory);
    persistAgendaLocally();
  }
  return changed;
}

function mergePeopleDirectory(localItems, remoteItems) {
  const map = new Map();
  [...(remoteItems || []), ...(localItems || [])].forEach((item) => {
    if (!item) return;
    const key = item.id || `${normalizeEmail(item.email)}:${String(item.name || "").trim().toLowerCase()}`;
    if (!key || key === ":") return;
    const existing = map.get(key);
    const itemDate = item.updatedAt || item.createdAt || "";
    const existingDate = existing?.updatedAt || existing?.createdAt || "";
    if (!existing || itemDate >= existingDate) {
      map.set(key, item);
    }
  });
  return [...map.values()].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatLastSeen(value) {
  return value ? formatDateTime(value) : "sin conexion registrada";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function encodePayload(value) {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodePayload(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function getAppBaseUrl() {
  const configured = window.AGENDA_CONFIG?.appBaseUrl;
  if (configured) return configured.replace(/\/$/, "/");
  return `${location.origin}${location.pathname}`;
}

