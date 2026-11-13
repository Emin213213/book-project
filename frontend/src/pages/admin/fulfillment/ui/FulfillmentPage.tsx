import { useEffect, useState } from 'react';
import { useShipmentsStore } from '@/modules/shipment';
import { useOrdersStore } from '@/modules/order';
import type { PackingListOrder, Shipment, ShipmentItem } from '@/modules/shipment';
import { generateCSV } from '@/modules/shipment';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Modal from '@/shared/ui/Modal.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './FulfillmentPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

const shipStatusLabels: Record<string, string> = { draft: 'Чернетка', packing: 'Пакування', ready: 'Готово', shipped: 'Відправлено', delivered: 'Доставлено' };
const shipStatusColors: Record<string, string> = { draft: '#6B7280', packing: '#F59E0B', ready: '#6366F1', shipped: '#3B82F6', delivered: '#10B981' };

export default function FulfillmentPage() {
  const { shipments, fetchShipments, createShipment, updateStatus, updateNote, toggleItemPacked, markMissing } = useShipmentsStore();
  const { orders, fetchOrders, updateStatus: updateOrderStatus } = useOrdersStore();

  const [showCreate, setShowCreate] = useState(false);
  const [plName, setPlName] = useState('');
  const [plCarrier, setPlCarrier] = useState<'nova-poshta' | 'ukrposhta'>('nova-poshta');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [orderCities, setOrderCities] = useState<Record<number, string>>({});
  const [orderWarehouses, setOrderWarehouses] = useState<Record<number, string>>({});
  const [packingId, setPackingId] = useState<number | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const [missingKeys, setMissingKeys] = useState<Set<string>>(new Set());
  const [ttnInput, setTtnInput] = useState('');

  useEffect(() => { fetchShipments(); fetchOrders(); }, [fetchShipments, fetchOrders]);
  const refresh = () => { fetchShipments(); fetchOrders(); };

  const shippedOrderIds = new Set(shipments.flatMap(s => s.orders.map(o => o.orderId)));
  const availableOrders = orders.filter(o => (o.status === 'processing' || o.status === 'pending') && !shippedOrderIds.has(o.id));

  const handleCreatePL = async () => {
    if (!plName.trim() || selectedOrderIds.size === 0) return;
    const plOrders: PackingListOrder[] = [...selectedOrderIds].map(oid => {
      const o = orders.find(x => x.id === oid)!;
      return { orderId: oid, customerName: o.customerName, customerPhone: o.customerPhone, city: orderCities[oid] || '', warehouse: orderWarehouses[oid] || '',
        items: o.items.map(i => ({ bookId: i.bookId, title: i.title, quantity: i.quantity, packed: false })), packed: false };
    });
    await createShipment(plName.trim(), plOrders, plCarrier);
    for (const oid of selectedOrderIds) await updateOrderStatus(oid, 'packing');
    setShowCreate(false); setPlName(''); setSelectedOrderIds(new Set()); setOrderCities({}); setOrderWarehouses({});
    refresh();
  };

  const handleExportCSV = (s: Shipment) => {
    const csv = generateCSV(s);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `packing-list-${s.id}.csv`; a.click();
  };

  const ps = packingId ? shipments.find(s => s.id === packingId) : null;
  const allPacked = ps?.orders.every(o => o.items.every(i => i.packed)) ?? false;

  const handleShip = async (s: Shipment) => {
    if (!ttnInput.trim()) return;
    await updateNote(s.id, `ТТН: ${ttnInput.trim()}`);
    await updateStatus(s.id, 'shipped');
    for (const o of s.orders) await updateOrderStatus(o.orderId, 'shipped');
    setTtnInput(''); refresh();
  };

  const handleConfirmMissing = async () => {
    if (!ps) return;
    const missing: ShipmentItem[] = [];
    for (const key of missingKeys) { const [, bid] = key.split('-'); for (const o of ps.orders) { const it = o.items.find(i => String(i.bookId) === bid); if (it && !it.packed) missing.push(it); } }
    await markMissing(ps.id, missing);
    for (const o of ps.orders) await updateOrderStatus(o.orderId, 'on_hold');
    // Missing items will be handled via Supplier Orders page
    setShowMissing(false); setPackingId(null); setMissingKeys(new Set()); refresh();
  };

  return (
    <>
      <AdminHeader title="Відправки (Fulfillment)">
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}><Icon name="add" /> Новий пакінг-лист</button>
      </AdminHeader>

      {shipments.map(s => (
        <AdminCard key={s.id} title={s.name} icon={s.carrier === 'nova-poshta' ? 'local_shipping' : 'markunread_mailbox'}
          headerRight={<div className={styles.headerActions}>
            <span className={styles.statusBadge} style={{ background: `${shipStatusColors[s.status]}12`, color: shipStatusColors[s.status] }}>{shipStatusLabels[s.status]}</span>
            <span className={styles.orderCount}>{s.orders.length} замовл.</span>
          </div>}>
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead><tr><th>Замовлення</th><th>Отримувач</th><th>Місто</th><th>Відділення</th><th>Пакування</th><th>Статус</th></tr></thead>
              <tbody>
                {s.orders.map(o => (
                  <tr key={o.orderId}>
                    <td><strong>#{o.orderId}</strong></td>
                    <td>{o.customerName}<br/><span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{o.customerPhone}</span></td>
                    <td>{o.city || '—'}</td><td>{o.warehouse || '—'}</td>
                    <td>{o.items.filter(i => i.packed).length}/{o.items.length}</td>
                    <td>{o.packed ? <span className={styles.packedBadge}><Icon name="check_circle" /> OK</span> : <span className={styles.pendingBadge}><Icon name="hourglass_empty" /> Очікує</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.shipActions}>
            {s.missingItems.length > 0 && <span className={styles.missingAlert}><Icon name="warning" /> {s.missingItems.length} не вистачає</span>}
            <div className={styles.shipActionsRight}>
              <button className={styles.csvBtn} onClick={() => handleExportCSV(s)} title="CSV для Нової Пошти"><Icon name="download" /> CSV</button>
              {(s.status === 'draft' || s.status === 'packing') && <button className={styles.packBtn} onClick={() => setPackingId(s.id)}><Icon name="inventory_2" /> Пакування</button>}
              {s.status === 'ready' && <div className={styles.shipGroup}><input className={styles.ttnInput} placeholder="ТТН..." value={ttnInput} onChange={e => setTtnInput(e.target.value)} /><button className={styles.shipBtn} onClick={() => handleShip(s)}><Icon name="send" /> Відправити</button></div>}
              {s.status === 'shipped' && <button className={styles.deliverBtn} onClick={async () => { await updateStatus(s.id, 'delivered'); for (const o of s.orders) await updateOrderStatus(o.orderId, 'completed'); refresh(); }}><Icon name="check_circle" /> Доставлено</button>}
            </div>
          </div>
        </AdminCard>
      ))}

      {shipments.length === 0 && <div className={styles.emptyBlock}><Icon name="local_shipping" /><p>Створіть пакінг-лист</p></div>}


      {/* Create packing list */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Новий пакінг-лист">
        <div className={styles.createModal}>
          <div className={styles.cg}><label className={styles.cl}>Назва</label><input className={styles.ci} placeholder={`Відправка ${new Date().toLocaleDateString('uk-UA')}`} value={plName} onChange={e=>setPlName(e.target.value)} /></div>
          <div className={styles.cg}>
            <label className={styles.cl}>Перевізник</label>
            <div className={styles.carrierPick}>
              <label className={`${styles.carrierOpt} ${plCarrier==='nova-poshta'?styles.carrierActive:''}`}><input type="radio" hidden checked={plCarrier==='nova-poshta'} onChange={()=>setPlCarrier('nova-poshta')} /><Icon name="local_shipping"/> Нова Пошта</label>
              <label className={`${styles.carrierOpt} ${plCarrier==='ukrposhta'?styles.carrierActive:''}`}><input type="radio" hidden checked={plCarrier==='ukrposhta'} onChange={()=>setPlCarrier('ukrposhta')} /><Icon name="markunread_mailbox"/> Укрпошта</label>
            </div>
          </div>
          <div className={styles.cg}>
            <label className={styles.cl}>Замовлення ({availableOrders.length})</label>
            {availableOrders.length===0?<p className={styles.noOrders}>Немає замовлень</p>:(
              <div className={styles.orderPicker}>
                {availableOrders.map(o=>(
                  <div key={o.id} className={`${styles.opItem} ${selectedOrderIds.has(o.id)?styles.opItemActive:''}`}>
                    <label className={styles.opHeader}><input type="checkbox" checked={selectedOrderIds.has(o.id)} onChange={() => {
                      const nextOrderIds = new Set(selectedOrderIds);
                      if (nextOrderIds.has(o.id)) {
                        nextOrderIds.delete(o.id);
                      } else {
                        nextOrderIds.add(o.id);
                      }
                      setSelectedOrderIds(nextOrderIds);
                    }} /><strong>#{o.id}</strong> — {o.customerName}<span className={styles.opTotal}>{o.total} ₴</span></label>
                    {selectedOrderIds.has(o.id)&&<div className={styles.opFields}><input className={styles.ci} placeholder="Місто..." value={orderCities[o.id]||''} onChange={e=>setOrderCities(p=>({...p,[o.id]:e.target.value}))} /><input className={styles.ci} placeholder="Відділення..." value={orderWarehouses[o.id]||''} onChange={e=>setOrderWarehouses(p=>({...p,[o.id]:e.target.value}))} /></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.createActions}><button className={styles.cancelBtn} onClick={()=>setShowCreate(false)}>Скасувати</button><button className={styles.createSubmit} disabled={!plName.trim()||selectedOrderIds.size===0} onClick={handleCreatePL}><Icon name="add"/> Створити ({selectedOrderIds.size})</button></div>
        </div>
      </Modal>

      {/* Packing modal */}
      <Modal isOpen={!!ps} onClose={()=>setPackingId(null)} title={ps?`Пакування — ${ps.name}`:''}>
        {ps&&<div className={styles.packingModal}>
          {ps.orders.map(o=>(
            <div key={o.orderId} className={`${styles.packOrder} ${o.packed?styles.packOrderDone:''}`}>
              <div className={styles.poHeader}><strong>#{o.orderId}</strong> — {o.customerName} {o.packed&&<span className={styles.packedBadge}><Icon name="check_circle"/></span>}</div>
              <div className={styles.packItems}>{o.items.map(item=>(
                <label key={item.bookId} className={`${styles.pi} ${item.packed?styles.piDone:''}`}>
                  <input type="checkbox" checked={item.packed} onChange={()=>{ toggleItemPacked(ps.id,o.orderId,item.bookId).then(refresh); }} className={styles.piCheck} />
                  <span className={styles.piTitle}>{item.title}</span><span className={styles.piQty}>x{item.quantity}</span>{item.packed&&<Icon name="check"/>}
                </label>
              ))}</div>
            </div>
          ))}
          <div className={styles.packActions}>
            <button className={styles.missingBtn} onClick={()=>setShowMissing(true)}><Icon name="report_problem"/> Не вистачає</button>
            <button className={styles.readyBtn} disabled={!allPacked} onClick={async()=>{await updateStatus(ps.id,'ready');setPackingId(null);refresh();}}><Icon name="check"/> Все запаковано</button>
          </div>
        </div>}
      </Modal>

      {/* Missing modal */}
      <Modal isOpen={showMissing&&!!ps} onClose={()=>setShowMissing(false)} title="Відсутні товари">
        {ps&&<div className={styles.missingModal}>
          <p className={styles.missingHint}>Замовлення на паузу, постачальнику — дозамовлення.</p>
          <div className={styles.missingList}>{ps.orders.flatMap(o=>o.items.filter(i=>!i.packed).map(item=>{const k=`${o.orderId}-${item.bookId}`;return(
            <label key={k} className={styles.missingItem}><input type="checkbox" checked={missingKeys.has(k)} onChange={() => {
              const nextMissingKeys = new Set(missingKeys);
              if (nextMissingKeys.has(k)) {
                nextMissingKeys.delete(k);
              } else {
                nextMissingKeys.add(k);
              }
              setMissingKeys(nextMissingKeys);
            }} /><span>#{o.orderId} — {item.title} x{item.quantity}</span></label>
          );}))}</div>
          <div className={styles.missingActions}><button className={styles.cancelBtn} onClick={()=>setShowMissing(false)}>Скасувати</button><button className={styles.confirmMissingBtn} disabled={missingKeys.size===0} onClick={handleConfirmMissing}><Icon name="warning"/> Підтвердити ({missingKeys.size})</button></div>
        </div>}
      </Modal>
    </>
  );
}
