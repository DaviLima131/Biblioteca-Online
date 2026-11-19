import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  formatLoanDate,
  getLoanOverdueInfo,
  type LoanRequest,
  type LoanStatus,
} from './books';

type Props = {
  loanRequests: LoanRequest[];
  customerAddresses: { name: string; address: string }[];
  onBack: () => void;
  onDeleteLoanRequest: (loanId: string) => void;
  onUpdateLoanStatus: (loanId: string, status: LoanStatus) => void;
};

type FilterStatus = LoanStatus | 'overdue' | 'all';

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Solicitados', value: 'requested' },
  { label: 'Emprestados', value: 'borrowed' },
  { label: 'Devoluções', value: 'returnRequested' },
  { label: 'Atrasados', value: 'overdue' },
  { label: 'Devolvidos', value: 'returned' },
];

const statusLabels: Record<LoanStatus, string> = {
  requested: 'Solicitado',
  borrowed: 'Emprestado',
  returnRequested: 'Devolução solicitada',
  returned: 'Devolvido',
};

export default function AdminLoansScreen({
  loanRequests,
  customerAddresses,
  onBack,
  onDeleteLoanRequest,
  onUpdateLoanStatus,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const searchTerm = search.trim().toLocaleLowerCase();
  const requestedCount = loanRequests.filter(
    (request) => request.status === 'requested'
  ).length;
  const borrowedCount = loanRequests.filter(
    (request) => request.status === 'borrowed'
  ).length;
  const returnRequestedCount = loanRequests.filter(
    (request) => request.status === 'returnRequested'
  ).length;
  const returnedCount = loanRequests.filter(
    (request) => request.status === 'returned'
  ).length;
  const overdueCount = loanRequests.filter((request) =>
    getLoanOverdueInfo(request).isOverdue
  ).length;
  const filteredRequests = loanRequests.filter((request) => {
    const matchesStatus =
      selectedFilter === 'all' ||
      (selectedFilter === 'overdue'
        ? getLoanOverdueInfo(request).isOverdue
        : request.status === selectedFilter);
    const matchesSearch =
      !searchTerm ||
      request.bookTitle.toLocaleLowerCase().includes(searchTerm) ||
      request.borrowerName.toLocaleLowerCase().includes(searchTerm) ||
      request.pickupLocation.toLocaleLowerCase().includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Voltar à biblioteca</Text>
        </Pressable>

        <Text style={styles.eyebrow}>ÁREA DO ADMINISTRADOR</Text>
        <Text style={styles.title}>Empréstimos</Text>
        <Text style={styles.subtitle}>
          Acompanhe solicitações, retiradas e devoluções.
        </Text>

        <Text style={styles.sectionTitle}>Endereços cadastrados</Text>
        {customerAddresses.length === 0 ? (
          <Text style={styles.addressEmpty}>
            Nenhum endereço cadastrado ainda.
          </Text>
        ) : (
          customerAddresses.map((customer, index) => (
            <View
              key={`${customer.name}-${index}`}
              style={styles.addressCard}
            >
              <Text style={styles.addressName}>{customer.name}</Text>
              <Text style={styles.addressValue}>
                {customer.address || 'Endereço não informado'}
              </Text>
            </View>
          ))
        )}

        <View style={styles.summary}>
          <SummaryCard label="Total" value={loanRequests.length} />
          <SummaryCard label="Novos" value={requestedCount} />
          <SummaryCard label="Emprestados" value={borrowedCount} />
          <SummaryCard label="Devoluções" value={returnRequestedCount} />
          <SummaryCard label="Atrasados" value={overdueCount} />
          <SummaryCard label="Devolvidos" value={returnedCount} />
        </View>

        <TextInput
          accessibilityLabel="Buscar empréstimos"
          style={styles.search}
          placeholder="Buscar por livro, usuário ou local..."
          placeholderTextColor="#938B7A"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.value;

            return (
              <Pressable
                key={filter.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelectedFilter(filter.value)}
                style={[
                  styles.filter,
                  isSelected && styles.filterSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {loanRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>Nenhum empréstimo ainda</Text>
            <Text style={styles.emptyDescription}>
              As solicitações dos usuários aparecerão aqui.
            </Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum resultado</Text>
            <Text style={styles.emptyDescription}>
              Tente mudar o filtro ou o termo de busca.
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => {
            const overdueInfo = getLoanOverdueInfo(request);

            return (
              <View key={request.id} style={styles.loanCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bookTitle}>{request.bookTitle}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      request.status === 'borrowed' && styles.borrowedBadge,
                      request.status === 'returned' && styles.returnedBadge,
                      overdueInfo.isOverdue && styles.overdueBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        request.status === 'returned' && styles.returnedText,
                        overdueInfo.isOverdue && styles.overdueText,
                      ]}
                    >
                      {overdueInfo.isOverdue
                        ? `Atrasado ${overdueInfo.daysLate} dia${overdueInfo.daysLate === 1 ? '' : 's'}`
                        : `Atual: ${statusLabels[request.status]}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.detailLabel}>Usuário</Text>
                <Text style={styles.detailValue}>{request.borrowerName}</Text>
                <Text style={styles.detailLabel}>Local para retirada</Text>
                <Text style={styles.detailValue}>{request.pickupLocation}</Text>
                <Text style={styles.requestedAt}>
                  Solicitação: {request.requestedAt}
                </Text>
                {request.pickedUpAt && (
                  <Text style={styles.requestedAt}>
                    Retirada: {request.pickedUpAt}
                  </Text>
                )}
                {request.status === 'borrowed' && request.dueDate && (
                  <Text
                    style={[
                      styles.requestedAt,
                      overdueInfo.isOverdue && styles.overdueDate,
                    ]}
                  >
                    Prazo de entrega: {formatLoanDate(request.dueDate)}
                  </Text>
                )}
                {request.returnedAt && (
                  <Text style={styles.requestedAt}>
                    Devolução: {request.returnedAt}
                  </Text>
                )}
                {request.status === 'requested' && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      Alert.alert(
                        'Confirmar retirada',
                        `Confirmar que ${request.borrowerName} retirou "${request.bookTitle}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Confirmar retirada',
                            onPress: () =>
                              onUpdateLoanStatus(request.id, 'borrowed'),
                          },
                        ]
                      )
                    }
                    style={({ pressed }) => [
                      styles.confirmButton,
                      pressed && styles.confirmButtonPressed,
                    ]}
                  >
                    <Text style={styles.confirmButtonText}>
                      Confirmar retirada de {request.borrowerName}
                    </Text>
                  </Pressable>
                )}
                {request.status === 'returnRequested' && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      Alert.alert(
                        'Confirmar devolução',
                        `Confirmar que ${request.borrowerName} devolveu "${request.bookTitle}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Confirmar devolução',
                            onPress: () =>
                              onUpdateLoanStatus(request.id, 'returned'),
                          },
                        ]
                      )
                    }
                    style={({ pressed }) => [
                      styles.confirmButton,
                      pressed && styles.confirmButtonPressed,
                    ]}
                  >
                    <Text style={styles.confirmButtonText}>
                      Confirmar devolução de {request.borrowerName}
                    </Text>
                  </Pressable>
                )}
                {request.status === 'returned' && (
                  pendingDeleteId === request.id ? (
                    <View style={styles.deleteConfirmation}>
                      <Text style={styles.deleteConfirmationText}>
                        Excluir este registro de empréstimo?
                      </Text>
                      <View style={styles.deleteActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setPendingDeleteId(null)}
                          style={styles.cancelDeleteButton}
                        >
                          <Text style={styles.cancelDeleteText}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            onDeleteLoanRequest(request.id);
                            setPendingDeleteId(null);
                          }}
                          style={styles.deleteButton}
                        >
                          <Text style={styles.deleteButtonText}>Excluir</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir registro do empréstimo de ${request.bookTitle}`}
                      onPress={() => setPendingDeleteId(request.id)}
                      style={styles.trashButton}
                    >
                      <Text style={styles.trashButtonText}>🗑</Text>
                    </Pressable>
                  )
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF9E9',
  },
  content: {
    padding: 22,
    paddingTop: 45,
    paddingBottom: 35,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 22,
  },
  backText: {
    color: '#66552A',
    fontSize: 14,
    fontWeight: '700',
  },
  eyebrow: {
    color: '#9A791F',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#29271F',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: '#817D72',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#29271F',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E9DA',
    borderRadius: 13,
    padding: 14,
    marginBottom: 8,
  },
  addressName: {
    color: '#29271F',
    fontSize: 14,
    fontWeight: '800',
  },
  addressValue: {
    color: '#454237',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  addressEmpty: {
    color: '#817D72',
    fontSize: 13,
    marginBottom: 18,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 78,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E9DA',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  summaryValue: {
    color: '#29271F',
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#817D72',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  search: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAE3D4',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#29271F',
    fontSize: 13,
  },
  filters: {
    gap: 8,
    paddingVertical: 15,
  },
  filter: {
    borderWidth: 1,
    borderColor: '#E7DFCD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  filterSelected: {
    backgroundColor: '#29271F',
    borderColor: '#29271F',
  },
  filterText: {
    color: '#625D51',
    fontSize: 11,
    fontWeight: '700',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2EBD9',
    borderRadius: 20,
    padding: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#29271F',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#817D72',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E9DA',
    borderRadius: 17,
    padding: 17,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  bookTitle: {
    flex: 1,
    color: '#29271F',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    backgroundColor: '#FFF1C4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  borrowedBadge: {
    backgroundColor: '#DDEBFA',
  },
  overdueBadge: {
    backgroundColor: '#F5D8D2',
  },
  returnedBadge: {
    backgroundColor: '#E3E9D5',
  },
  statusText: {
    color: '#725719',
    fontSize: 10,
    fontWeight: '800',
  },
  returnedText: {
    color: '#44553C',
  },
  overdueText: {
    color: '#A33A2B',
  },
  overdueDate: {
    color: '#A33A2B',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E9DA',
    marginVertical: 14,
  },
  detailLabel: {
    color: '#938B7A',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
  },
  detailValue: {
    color: '#454237',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  requestedAt: {
    color: '#938B7A',
    fontSize: 11,
    marginTop: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 9,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: '#E7DFCD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 18,
  },
  statusOptionSelected: {
    backgroundColor: '#29271F',
    borderColor: '#29271F',
  },
  statusOptionPressed: {
    opacity: 0.75,
  },
  statusOptionText: {
    color: '#625D51',
    fontSize: 11,
    fontWeight: '700',
  },
  statusOptionTextSelected: {
    color: '#FFFFFF',
  },
  confirmButton: {
    minHeight: 44,
    backgroundColor: '#F1C43F',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  confirmButtonDisabled: {
    backgroundColor: '#F3EFE5',
  },
  confirmButtonPressed: {
    opacity: 0.8,
  },
  confirmButtonText: {
    color: '#302817',
    fontSize: 13,
    fontWeight: '800',
  },
  confirmButtonTextDisabled: {
    color: '#938B7A',
  },
  trashButton: {
    alignSelf: 'flex-end',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F6',
    borderWidth: 1,
    borderColor: '#F0D8D4',
    borderRadius: 11,
    marginTop: 8,
  },
  trashButtonText: {
    color: '#A33A2B',
    fontSize: 18,
  },
  deleteConfirmation: {
    backgroundColor: '#FFF8F6',
    borderWidth: 1,
    borderColor: '#E8C9C4',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  deleteConfirmationText: {
    color: '#65332D',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  cancelDeleteButton: {
    borderWidth: 1,
    borderColor: '#E7DFCD',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  cancelDeleteText: {
    color: '#625D51',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#A33A2B',
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 13,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
