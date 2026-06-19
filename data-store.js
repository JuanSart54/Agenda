(function () {
  const USERS_COLLECTION = "trackionUsers";
  const INVITATIONS_COLLECTION = "trackionInvitations";
  const DEFAULT_AGENDA_ID = "default";

  function isFirebaseConfigured(config) {
    return Boolean(
      config?.syncMode === "firebase" &&
      config.firebase?.apiKey &&
      config.firebase?.projectId &&
      config.firebase?.appId
    );
  }

  function createLocalStore() {
    return {
      mode: "local",
      requiresAuth: false,
      getUser() {
        return null;
      },
      onAuthStateChanged(callback) {
        callback(null);
        return () => {};
      },
      async signIn() {},
      async register() {},
      async resetPassword() {},
      async signOut() {},
      async load() {
        return [];
      },
      async loadAgenda() {
        return { tasks: [], agents: [], guests: [], userSettings: {} };
      },
      async save() {},
      async saveAgenda() {},
      subscribe() {
        return () => {};
      },
      subscribeAgenda() {
        return () => {};
      },
      async sendInvitation() {},
      subscribeInvitations() {
        return () => {};
      },
      subscribeSentInvitations() {
        return () => {};
      },
      async updateInvitation() {},
      async deleteInvitation() {
        return;
      }
    };
  }

  async function createFirebaseStore(config) {
    const [{ initializeApp }, firestore, authSdk] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js")
    ]);

    const {
      getFirestore,
      doc,
      collection,
      addDoc,
      getDoc,
      setDoc,
      updateDoc,
      serverTimestamp,
      enableIndexedDbPersistence,
      onSnapshot,
      query,
      where
    } = firestore;

    const {
      getAuth,
      onAuthStateChanged,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      sendPasswordResetEmail,
      signOut: firebaseSignOut
    } = authSdk;

    const app = initializeApp(config.firebase);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const agendaId = config.agendaId || DEFAULT_AGENDA_ID;
    enableIndexedDbPersistence(db).catch(() => {});

    function getAgendaRef() {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado");
      return doc(db, USERS_COLLECTION, user.uid, "agendas", agendaId);
    }

    return {
      mode: "firebase",
      requiresAuth: true,
      agendaId,
      getUser() {
        return auth.currentUser;
      },
      onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
      },
      async signIn(email, password) {
        await signInWithEmailAndPassword(auth, email, password);
      },
      async register(email, password) {
        await createUserWithEmailAndPassword(auth, email, password);
      },
      async resetPassword(email) {
        await sendPasswordResetEmail(auth, email);
      },
      async signOut() {
        await firebaseSignOut(auth);
      },
      async load() {
        if (!auth.currentUser) return [];
        const snap = await getDoc(getAgendaRef());
        return snap.exists() ? (snap.data().tasks || []) : [];
      },
      async loadAgenda() {
        if (!auth.currentUser) return { tasks: [], agents: [], guests: [], userSettings: {} };
        const snap = await getDoc(getAgendaRef());
        if (!snap.exists()) return { tasks: [], agents: [], guests: [], userSettings: {} };
        const data = snap.data();
        return {
          tasks: data.tasks || [],
          agents: data.agents || [],
          guests: data.guests || [],
          userSettings: data.userSettings || {}
        };
      },
      async save(tasks) {
        if (!auth.currentUser) return;
        await setDoc(getAgendaRef(), {
          ownerUid: auth.currentUser.uid,
          ownerEmail: auth.currentUser.email || "",
          agendaId,
          tasks,
          updatedAt: serverTimestamp()
        }, { merge: true });
      },
      async saveAgenda(agenda) {
        if (!auth.currentUser) return;
        await setDoc(getAgendaRef(), {
          ownerUid: auth.currentUser.uid,
          ownerEmail: auth.currentUser.email || "",
          agendaId,
          tasks: agenda.tasks || [],
          agents: agenda.agents || [],
          guests: agenda.guests || [],
          userSettings: agenda.userSettings || {},
          updatedAt: serverTimestamp()
        }, { merge: true });
      },
      subscribe(callback) {
        if (!auth.currentUser) return () => {};
        return onSnapshot(getAgendaRef(), (snap) => {
          callback(snap.exists() ? (snap.data().tasks || []) : []);
        }, (error) => {
          console.warn("Sincronizacion en tiempo real no disponible.", error);
        });
      },
      subscribeAgenda(callback) {
        if (!auth.currentUser) return () => {};
        return onSnapshot(getAgendaRef(), (snap) => {
          const data = snap.exists() ? snap.data() : {};
          callback({
            tasks: data.tasks || [],
            agents: data.agents || [],
            guests: data.guests || [],
            userSettings: data.userSettings || {}
          });
        }, (error) => {
          console.warn("Sincronizacion completa de agenda no disponible.", error);
        });
      },
      async sendInvitation(invitation) {
        if (!auth.currentUser) throw new Error("Usuario no autenticado");
        const now = new Date().toISOString();
        const recipientEmail = String(invitation.recipientEmail || "").trim().toLowerCase();
        if (!recipientEmail) throw new Error("La invitacion necesita email de destinatario");
        return addDoc(collection(db, INVITATIONS_COLLECTION), {
          ...invitation,
          recipientEmail,
          recipientEmailLower: recipientEmail,
          ownerUid: auth.currentUser.uid,
          ownerEmail: auth.currentUser.email || "",
          agendaId,
          status: invitation.status || "pending",
          createdAt: invitation.createdAt || now,
          updatedAt: now,
          serverUpdatedAt: serverTimestamp()
        });
      },
      subscribeInvitations(callback) {
        const user = auth.currentUser;
        if (!user?.email) return () => {};
        const q = query(
          collection(db, INVITATIONS_COLLECTION),
          where("recipientEmailLower", "==", user.email.toLowerCase())
        );
        return onSnapshot(q, (snap) => {
          callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
        }, (error) => {
          console.warn("Invitaciones entrantes no disponibles.", error);
        });
      },
      subscribeSentInvitations(callback) {
        const user = auth.currentUser;
        if (!user) return () => {};
        const q = query(
          collection(db, INVITATIONS_COLLECTION),
          where("ownerUid", "==", user.uid)
        );
        return onSnapshot(q, (snap) => {
          callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
        }, (error) => {
          console.warn("Invitaciones enviadas no disponibles.", error);
        });
      },
      async updateInvitation(invitationId, patch) {
        if (!auth.currentUser || !invitationId) return;
        await updateDoc(doc(db, INVITATIONS_COLLECTION, invitationId), {
          ...patch,
          updatedAt: new Date().toISOString(),
          serverUpdatedAt: serverTimestamp()
        });
      }
    };
  }

  window.AgendaDataStore = {
    async create(config) {
      if (!isFirebaseConfigured(config)) return createLocalStore();

      try {
        return await createFirebaseStore(config);
      } catch (error) {
        console.warn("Sincronizacion Firebase no disponible. Modo local activo.", error);
        return createLocalStore();
      }
    }
  };
})();
