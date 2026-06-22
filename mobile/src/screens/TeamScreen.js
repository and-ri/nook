import React, { useCallback, useState } from 'react';
import { Alert as RNAlert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslations } from 'use-intl';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import Field from '../components/Field';
import {
  getTeams, getTeamMembers, inviteMember, revokeInvitation,
  removeMember, leaveTeam, createTeam, renameTeam, deleteTeam, activateTeam,
} from '../api';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { Pressable } from '@/components/ui/pressable';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Alert, AlertText } from '@/components/ui/alert';

function Section({ title, description, children }) {
  return (
    <VStack space="md" className="bg-background-50 border border-outline-100 rounded-2xl p-4">
      <VStack space="xs">
        <Heading size="md">{title}</Heading>
        {!!description && <Text className="text-sm text-typography-500">{description}</Text>}
      </VStack>
      {children}
    </VStack>
  );
}

export default function TeamScreen({ navigation }) {
  const t = useTranslations('Team');
  const tCommon = useTranslations('Common');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [role, setRole] = useState('MEMBER');
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [newTeamName, setNewTeamName] = useState('');

  const isOwner = role === 'OWNER';
  const activeTeam = teams.find((x) => x.id === activeTeamId) || null;

  const load = useCallback(async () => {
    setError(null);
    try {
      const t1 = await getTeams();
      setTeams(t1.teams || []);
      setActiveTeamId(t1.activeTeamId ?? null);
      const active = (t1.teams || []).find((x) => x.id === t1.activeTeamId) || (t1.teams || [])[0];
      if (active) {
        setTeamName(active.name);
        const m = await getTeamMembers(active.id);
        setRole(m.role);
        setMembers(m.members || []);
        setInvitations(m.invitations || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = async (fn, successMsg) => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await fn();
      if (successMsg) setNotice(successMsg);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = (message, onYes) =>
    RNAlert.alert('', message, [
      { text: tCommon('cancel'), style: 'cancel' },
      { text: 'OK', style: 'destructive', onPress: onYes },
    ]);

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <Spinner size="large" />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <ScreenHeader title={t('title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <VStack space="lg">
          <Text className="text-sm text-typography-500">{t('description')}</Text>

          {!!error && (
            <Alert action="error" variant="outline">
              <AlertText>{error}</AlertText>
            </Alert>
          )}
          {!!notice && (
            <Alert action="success" variant="outline">
              <AlertText>{notice}</AlertText>
            </Alert>
          )}

          {/* Current team */}
          <Section title={activeTeam?.name || ''} description={t('currentTeamDesc')}>
            <Badge action={isOwner ? 'success' : 'muted'} variant="outline" className="self-start">
              <BadgeText>{t(`role.${role}`)}</BadgeText>
            </Badge>
            {isOwner && (
              <HStack space="sm" className="items-end">
                <Box className="flex-1">
                  <Field label={t('teamName')}>
                    <Input>
                      <InputField value={teamName} onChangeText={setTeamName} />
                    </Input>
                  </Field>
                </Box>
                <Button variant="outline" isDisabled={busy} onPress={() => run(() => renameTeam(activeTeamId, teamName), t('renamed'))}>
                  <ButtonText>{t('rename')}</ButtonText>
                </Button>
              </HStack>
            )}
          </Section>

          {/* Members */}
          <Section title={t('members')}>
            {members.map((m) => (
              <HStack key={m.userId} className="items-center justify-between py-2 border-b border-outline-100">
                <VStack>
                  <Text className="font-medium text-typography-900">{m.name}</Text>
                  <Text className="text-xs text-typography-400">{m.email}</Text>
                </VStack>
                <HStack space="sm" className="items-center">
                  <Badge action={m.role === 'OWNER' ? 'success' : 'muted'} variant="outline">
                    <BadgeText>{t(`role.${m.role}`)}</BadgeText>
                  </Badge>
                  {isOwner && (
                    <Pressable
                      disabled={busy}
                      onPress={() => confirm(t('removeConfirm', { name: m.name }), () => run(() => removeMember(activeTeamId, m.userId), t('memberRemoved')))}
                      className="p-1"
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </Pressable>
                  )}
                </HStack>
              </HStack>
            ))}
          </Section>

          {/* Invite (owner only) */}
          {isOwner && (
            <Section title={t('invite')} description={t('inviteDesc')}>
              <HStack space="sm" className="items-end">
                <Box className="flex-1">
                  <Field label={t('email')}>
                    <Input>
                      <InputField
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        placeholder="name@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </Input>
                  </Field>
                </Box>
                <Button
                  isDisabled={busy || !inviteEmail}
                  onPress={() => run(async () => { await inviteMember(activeTeamId, inviteEmail); setInviteEmail(''); }, t('inviteSent'))}
                >
                  <ButtonText>{t('inviteButton')}</ButtonText>
                </Button>
              </HStack>

              {invitations.length > 0 && (
                <VStack space="xs">
                  <Text className="text-xs font-medium text-typography-400">{t('pendingInvites')}</Text>
                  {invitations.map((inv) => (
                    <HStack key={inv.id} className="items-center justify-between py-2 border-b border-outline-100">
                      <Text className="text-sm text-typography-700">{inv.email}</Text>
                      <Pressable disabled={busy} onPress={() => run(() => revokeInvitation(activeTeamId, inv.id), t('inviteRevoked'))} className="p-1">
                        <Text className="text-sm text-error-600">{t('revoke')}</Text>
                      </Pressable>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Section>
          )}

          {/* Your teams / switch / create */}
          <Section title={t('yourTeams')}>
            {teams.map((tm) => (
              <HStack key={tm.id} className="items-center justify-between py-2 border-b border-outline-100">
                <HStack space="sm" className="items-center flex-1">
                  <Text className="font-medium text-typography-900">{tm.name}</Text>
                  {tm.isActive && (
                    <Badge action="info" variant="outline">
                      <BadgeText>{t('active')}</BadgeText>
                    </Badge>
                  )}
                  <Text className="text-xs text-typography-400">{t('memberCount', { count: tm.memberCount })}</Text>
                </HStack>
                {!tm.isActive && (
                  <Button size="sm" variant="outline" isDisabled={busy} onPress={() => run(() => activateTeam(tm.id))}>
                    <ButtonText>{t('switchTo')}</ButtonText>
                  </Button>
                )}
              </HStack>
            ))}

            <HStack space="sm" className="items-end pt-1">
              <Box className="flex-1">
                <Field label={t('createTeam')}>
                  <Input>
                    <InputField value={newTeamName} onChangeText={setNewTeamName} placeholder={t('createPlaceholder')} />
                  </Input>
                </Field>
              </Box>
              <Button
                variant="outline"
                isDisabled={busy || !newTeamName}
                onPress={() => run(async () => { await createTeam(newTeamName); setNewTeamName(''); })}
              >
                <ButtonText>{t('create')}</ButtonText>
              </Button>
            </HStack>
          </Section>

          {/* Danger zone */}
          <Section title={t('dangerZone')}>
            <Button
              variant="outline"
              action="negative"
              isDisabled={busy}
              onPress={() => confirm(t('leaveConfirm'), () => run(() => leaveTeam(activeTeamId)))}
            >
              <ButtonText>{t('leave')}</ButtonText>
            </Button>
            {isOwner && (
              <Button
                action="negative"
                isDisabled={busy}
                onPress={() => confirm(t('deleteConfirm'), () => run(() => deleteTeam(activeTeamId)))}
              >
                <ButtonText>{t('deleteTeam')}</ButtonText>
              </Button>
            )}
          </Section>
        </VStack>
      </ScrollView>
    </Screen>
  );
}
