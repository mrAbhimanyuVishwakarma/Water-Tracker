import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { BeverageConfig, UserAccount, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants/beverages';
import { accountFromUser, isCloudConfigured, startAuthCallbacks, startSessionRefresh, supabase } from '../services/supabase';
import { billingOperation, hasPremium, identifyBillingUser, listenForBillingUpdates } from '../services/billing';
import { reconcileSync, syncAccount } from '../services/cloudSync';
import { dayKey, mergeLogs } from '../utils/accountData';
import { historyFromLogs, loadLocalData, LocalData, removeLocalAccount, resetGuestData, saveLocalData } from '../utils/storage';

export function useAccountData() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [data, setData] = useState<LocalData>({ settings: DEFAULT_SETTINGS, logs: [], pendingLogIds: [], settingsRevision: 0 });
  const [ready, setReady] = useState(false);
  const [premium, setPremium] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Saved on this device');
  const [revision, setRevision] = useState(0);
  const [day, setDay] = useState(dayKey());
  const owner = useRef<string | null>(null);
  const epoch = useRef(0);
  const dataRef = useRef(data);
  const localQueue = useRef<Promise<unknown>>(Promise.resolve());
  const syncing = useRef(false);
  const readyRef = useRef(false);
  const activateAccount = useRef<(account: UserAccount | null) => void>(() => {});

  const enqueue = useCallback(<T,>(task: () => Promise<T>) => {
    const promise = localQueue.current.then(task, task);
    localQueue.current = promise.catch(() => {});
    return promise;
  }, []);

  useEffect(() => {
    const generation = epoch;
    let active = true;
    let receivedEvent = false;
    const activate = (next: UserAccount | null) => {
      if (!active) return;
      const nextId = next?.id || null;
      if (readyRef.current && owner.current === nextId) { setAccount(next); return; }
      const ticket = ++epoch.current;
      owner.current = nextId;
      readyRef.current = false;
      setReady(false);
      setPremium(false);
      setAccount(next);
      void enqueue(async () => {
        try {
          const loaded = await loadLocalData(nextId);
          if (!active || ticket !== epoch.current) return;
          dataRef.current = loaded;
          setData(loaded);
          setSyncStatus(nextId ? 'Waiting to sync' : 'Saved on this device');
          readyRef.current = true;
          setReady(true);
          setRevision(value => value + 1);
        } catch {
          if (active && ticket === epoch.current) {
            setSyncStatus('Could not load saved data. Restart the app to retry.');
            Alert.alert('Storage unavailable', 'Your saved data could not be loaded. Restart the app to retry.');
          }
        }
      });
    };
    const stopRefresh = startSessionRefresh();
    activateAccount.current = activate;
    const stopCallbacks = startAuthCallbacks();
    if (!isCloudConfigured) activate(null);
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      receivedEvent = true;
      // Do not await Supabase calls inside its auth callback.
      activate(session?.user ? accountFromUser(session.user) : null);
    });
    if (isCloudConfigured) {
      void supabase.auth.getSession().then(({ data: result, error }) => {
        if (!receivedEvent && !error) activate(result.session?.user ? accountFromUser(result.session.user) : null);
        if (!receivedEvent && error) activate(null);
      }).catch(() => { if (!receivedEvent) activate(null); });
    }
    return () => { active = false; generation.current++; subscription.subscription.unsubscribe(); stopRefresh(); stopCallbacks(); };
  }, [enqueue]);

  const mutate = useCallback((change: (current: LocalData) => LocalData) => {
    const userId = owner.current;
    const ticket = epoch.current;
    return enqueue(async () => {
      if (ticket !== epoch.current || !readyRef.current) return;
      const next = change(dataRef.current);
      try { await saveLocalData(userId, next); }
      catch {
        Alert.alert('Could not save', 'Your change was not saved. Free up device storage and try again.');
        return;
      }
      if (ticket !== epoch.current) return;
      dataRef.current = next;
      setData(next);
      setRevision(value => value + 1);
      setSyncStatus(userId ? 'Changes saved on this device; waiting to sync' : 'Saved on this device');
    });
  }, [enqueue]);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => mutate(current => ({
    ...current, settings: { ...current.settings, ...partial, isPremium: false, userAccount: null },
    settingsRevision: current.settingsRevision + 1,
  })), [mutate]);

  const addDrink = useCallback((beverage: BeverageConfig, amount: number) => mutate(current => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    return { ...current, pendingLogIds: [...current.pendingLogIds, id], logs: mergeLogs(current.logs, [{ id,
      type: beverage.type, amount, effectiveAmount: Math.round(amount * beverage.hydrationMultiplier),
      timestamp: Date.now(), color: beverage.color }]),
    };
  }), [mutate]);

  const refreshPremium = useCallback(async () => {
    const userId = owner.current;
    const ticket = epoch.current;
    if (!userId) { setPremium(false); return; }
    try {
      const info = await billingOperation(() => identifyBillingUser(userId));
      if (ticket === epoch.current) setPremium(hasPremium(info));
    } catch { if (ticket === epoch.current) setPremium(false); }
  }, []);

  const syncNow = useCallback(async () => {
    const userId = owner.current;
    if (!userId || !readyRef.current || syncing.current) return;
    const ticket = epoch.current;
    syncing.current = true;
    setSyncStatus('Syncing…');
    try {
      await localQueue.current;
      if (ticket !== epoch.current) return;
      const snapshot = dataRef.current;
      const synced = await syncAccount(userId, snapshot);
      await enqueue(async () => {
        if (ticket !== epoch.current) return;
        const current = dataRef.current;
        const unchanged = current === snapshot;
        const next = reconcileSync(snapshot, current, synced);
        await saveLocalData(userId, next);
        if (ticket !== epoch.current) return;
        dataRef.current = next;
        setData(next);
        setSyncStatus(unchanged ? `Backed up at ${new Date().toLocaleTimeString()}` : 'New changes waiting to sync');
        if (!unchanged) setRevision(value => value + 1);
      });
    } catch {
      if (ticket === epoch.current) setSyncStatus('Backup unavailable. Changes are saved on this device; retrying.');
    } finally { syncing.current = false; }
  }, [enqueue]);

  useEffect(() => listenForBillingUpdates((userId, info) => {
    if (userId && owner.current === userId) setPremium(hasPremium(info));
  }), []);

  useEffect(() => {
    if (!ready || !account) return;
    const timer = setTimeout(() => { void syncNow(); }, 700);
    return () => clearTimeout(timer);
  }, [ready, account, revision, syncNow]);

  useEffect(() => {
    if (!ready) return;
    void refreshPremium();
    const retry = () => { setDay(dayKey()); void syncNow(); void refreshPremium(); };
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') retry(); });
    const interval = setInterval(retry, 60_000);
    return () => { foreground.remove(); clearInterval(interval); };
  }, [ready, account, refreshPremium, syncNow]);

  const resetGuest = useCallback(async () => {
    if (owner.current) {
      Alert.alert('Signed-in data', 'Sign out to reset guest data. To remove your account and cloud history, use Delete Account.');
      return;
    }
    const ticket = epoch.current;
    try {
      await enqueue(async () => {
        if (owner.current || ticket !== epoch.current) return;
        await resetGuestData();
        const fresh = await loadLocalData(null);
        if (owner.current || ticket !== epoch.current) return;
        dataRef.current = fresh; setData(fresh); setRevision(value => value + 1);
      });
    } catch { Alert.alert('Reset failed', 'Guest data could not be reset. Please try again.'); }
  }, [enqueue]);

  const clearDeletedAccount = useCallback(async (userId: string) => {
    await enqueue(() => removeLocalAccount(userId));
    if (owner.current === userId) activateAccount.current(null);
  }, [enqueue]);

  const settings = useMemo(() => {
    const trial = data.settings.mascotTrialStartedAt;
    const trialActive = trial !== null && Date.now() >= trial && Date.now() - trial < 60_000;
    return { ...data.settings, isPremium: premium, userAccount: account,
      unlockedCharacters: premium ? ['brownie', 'dodo', 'mammoth', 'sloth', 'turtle', 'penguin'] as UserSettings['unlockedCharacters'] : ['brownie'] as UserSettings['unlockedCharacters'],
      activeCharacter: !premium && !trialActive ? 'brownie' as const : data.settings.activeCharacter };
  }, [data.settings, premium, account]);
  const todayLogs = useMemo(() => data.logs.filter(log => dayKey(log.timestamp) === day), [data.logs, day]);
  const history = useMemo(() => {
    const firstDay = data.logs.length ? dayKey(data.logs[0].timestamp) : day;
    const days = Math.max(31, Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${firstDay}T00:00:00Z`)) / 86_400_000) + 1);
    return historyFromLogs(data.logs, settings, days, day);
  }, [data.logs, settings, day]);
  return { settings, todayLogs, history, ready, syncStatus, updateSettings, addDrink,
    refreshPremium, syncNow, resetGuest, clearDeletedAccount };
}
