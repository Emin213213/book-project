import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrdersStore } from '@/modules/order';
import { useManagersStore } from '@/modules/manager';
import type { OrderStatus } from '@/modules/order';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import CustomSelect from '@/shared/ui/CustomSelect.tsx';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import styles from './OrdersPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

const statusOptions = [
  { value: 'pending', label: 'Очікує' },
  { value: 'processing', label: 'В обробці' },
  { value: 'packing', label: 'Пакування' },
  { value: 'shipped', label: 'Відправлено' },
  { value: 'on_hold', label: 'На паузі' },
  { value: 'completed', label: 'Виконано' },
  { value: 'cancelled', label: 'Скасовано' },
];

const statusColors: Record<OrderStatus, string> = {
  pending: '#F59E0B',
  processing: '#6366F1',
  packing: '#8B5CF6',
  shipped: '#3B82F6',
  on_hold: '#EF4444',
  completed: '#10B981',
  cancelled: '#6B7280',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, fetchOrders, updateStatus, assignManager } = useOrdersStore();
  const { managers, fetchManagers } = useManagersStore();

  useEffect(() => {
    fetchOrders();
    fetchManagers();
  }, [fetchOrders, fetchManagers]);

  const handleStatusChange = async (id: number, status: string | number) => {
    await updateStatus(id, status as OrderStatus);
    fetchOrders();
  };

  const handleAssignManager = async (orderId: number, managerId: string | number) => {
    await assignManager(orderId, managerId === '' ? null : Number(managerId));
    fetchOrders();
  };

  const managerOptions = [
    { value: '', label: 'Не призначено' },
    ...managers.map(m => ({ value: m.id, label: m.name })),
  ];

  return (
    <>
      <AdminHeader title="Замовлення" />

      {orders.length === 0 ? (
        <EmptyState icon="receipt_long" message="Замовлень поки немає" />
      ) : (
        <section className={styles.card}>
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Клієнт</th>
                  <th>Сума</th>
                  <th>Менеджер</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  return (
                    <tr key={order.id}>
                      <td className={tableStyles.textMuted}>#{order.id}</td>
                      <td>
                        <strong>{order.customerName}</strong>
                        <br />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.customerEmail}</span>
                      </td>
                      <td><strong>{order.total} &#8372;</strong></td>
                      <td>
                        <div style={{ width: 160 }}>
                          <CustomSelect
                            options={managerOptions}
                            value={order.managerId ?? ''}
                            onChange={(v) => handleAssignManager(order.id, v)}
                            placeholder="Призначити..."
                            size="compact"
                          />
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ background: `${statusColors[order.status]}15`, color: statusColors[order.status] }}
                        >
                          {statusOptions.find(s => s.value === order.status)?.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <div style={{ width: 140 }}>
                            <CustomSelect
                              options={statusOptions}
                              value={order.status}
                              onChange={(v) => handleStatusChange(order.id, v)}
                              size="compact"
                            />
                          </div>
                          <button
                            className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`}
                            title="Детальніше"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            <Icon name="visibility" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
