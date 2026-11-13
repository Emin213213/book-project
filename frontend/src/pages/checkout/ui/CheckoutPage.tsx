import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/modules/cart';
import { useOrdersStore } from '@/modules/order';
import { useUserStore } from '@/modules/user';
import { useAllBooksQuery } from '@/modules/book';
import type { Book } from '@/modules/book';
import type { Discount } from '@/modules/discount';
import { getEffectivePrice } from '@/modules/book';
import { getDiscountByCode, applyDiscount } from '@/modules/discount';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './CheckoutPage.module.css';

type Step = 'contact' | 'delivery' | 'payment';
type DeliveryMethod = 'nova-poshta' | 'ukrposhta' | 'pickup';
type PaymentMethod = 'card' | 'cash';

const deliveryOptions: { value: DeliveryMethod; label: string; icon: string; desc: string; price: number }[] = [
  { value: 'nova-poshta', label: 'Нова Пошта', icon: 'local_shipping', desc: 'Доставка 1-3 дні', price: 70 },
  { value: 'ukrposhta', label: 'Укрпошта', icon: 'markunread_mailbox', desc: 'Доставка 3-7 днів', price: 35 },
  { value: 'pickup', label: 'Самовивіз', icon: 'store', desc: 'м. Київ, вул. Хрещатик, 1', price: 0 },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clear } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { user, isAuth } = useUserStore();
  const { books } = useAllBooksQuery();

  const [step, setStep] = useState<Step>('contact');
  const [success, setSuccess] = useState(false);

  // Contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Delivery
  const [delivery, setDelivery] = useState<DeliveryMethod>('nova-poshta');
  const [city, setCity] = useState('');
  const [warehouse, setWarehouse] = useState('');

  // Payment
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<Discount | null>(null);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (isAuth && user) {
      if (!name) setName(user.name);
      if (!email) setEmail(user.email);
      if (!phone) setPhone(user.phone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, user]);

  if (items.length === 0 && !success) {
    return (
      <>
        <h2 className={styles.pageTitle}>Оформлення замовлення</h2>
        <EmptyState icon="shopping_cart" message="Кошик порожній" />
      </>
    );
  }

  if (success) {
    return (
      <div className={styles.successBlock}>
        <div className={styles.successIcon}><Icon name="check_circle" /></div>
        <h2 className={styles.successTitle}>Замовлення оформлено!</h2>
        <p className={styles.successText}>Дякуємо за покупку. Ми зв'яжемося з вами за вказаними контактними даними.</p>
        <button className={styles.successBtn} onClick={() => navigate('/')}>
          <Icon name="arrow_back" /> Повернутися до каталогу
        </button>
      </div>
    );
  }

  const cartBooks = items
    .map(item => { const book = books.find(b => b.id === item.bookId); return book ? { ...item, book } : null; })
    .filter(Boolean) as { bookId: number; quantity: number; book: Book }[];

  const subtotal = cartBooks.reduce((sum, item) => sum + getEffectivePrice(item.book) * item.quantity, 0);
  const deliveryCost = deliveryOptions.find(d => d.value === delivery)?.price ?? 0;
  const promoAmount = promoDiscount ? applyDiscount(promoDiscount, subtotal) : 0;
  const total = subtotal - promoAmount + deliveryCost;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');
    const d = await getDiscountByCode(promoCode.trim());
    if (!d) { setPromoError('Промокод не знайдено'); setPromoDiscount(null); return; }
    const amount = applyDiscount(d, subtotal);
    if (amount === 0) { setPromoError('Промокод не застосовується до цього замовлення'); setPromoDiscount(null); return; }
    setPromoDiscount(d);
  };

  const steps: { key: Step; label: string; num: number }[] = [
    { key: 'contact', label: 'Контакти', num: 1 },
    { key: 'delivery', label: 'Доставка', num: 2 },
    { key: 'payment', label: 'Оплата', num: 3 },
  ];

  const stepIdx = steps.findIndex(s => s.key === step);

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await createOrder({
      userId: isAuth && user ? user.id : null,
      items: cartBooks.map(({ book, quantity }) => ({
        bookId: book.id, title: book.title, price: getEffectivePrice(book), quantity,
      })),
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      total,
    });
    clear();
    setSuccess(true);
  };

  return (
    <>
      <h2 className={styles.pageTitle}>Оформлення замовлення</h2>

      {/* Steps indicator */}
      <div className={styles.steps}>
        {steps.map((s, i) => (
          <div key={s.key} className={`${styles.step} ${i <= stepIdx ? styles.stepActive : ''} ${i < stepIdx ? styles.stepDone : ''}`}>
            <div className={styles.stepCircle}>
              {i < stepIdx ? <Icon name="check" /> : s.num}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
            {i < steps.length - 1 && <div className={`${styles.stepLine} ${i < stepIdx ? styles.stepLineDone : ''}`} />}
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.form}>
          {/* Step 1: Contact */}
          {step === 'contact' && (
            <div className={styles.stepContent}>
              <h3 className={styles.sectionTitle}>
                <Icon name="person" /> Контактні дані
              </h3>
              <div className={styles.group}>
                <label className={styles.label}>Ім'я <span className={styles.required}>*</span></label>
                <input className={styles.input} type="text" placeholder="Ваше ім'я..." value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Email <span className={styles.required}>*</span></label>
                <input className={styles.input} type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Телефон</label>
                <input className={styles.input} type="tel" placeholder="+380 (XX) XXX-XX-XX" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <button className={styles.nextBtn} type="button" onClick={() => { if (name && email) setStep('delivery'); }}>
                Далі <Icon name="arrow_forward" />
              </button>
            </div>
          )}

          {/* Step 2: Delivery */}
          {step === 'delivery' && (
            <div className={styles.stepContent}>
              <h3 className={styles.sectionTitle}>
                <Icon name="local_shipping" /> Спосіб доставки
              </h3>
              <div className={styles.deliveryOptions}>
                {deliveryOptions.map(opt => (
                  <label
                    key={opt.value}
                    className={`${styles.deliveryCard} ${delivery === opt.value ? styles.deliveryCardActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={opt.value}
                      checked={delivery === opt.value}
                      onChange={() => setDelivery(opt.value)}
                      className={styles.radioHidden}
                    />
                    <div className={styles.deliveryIcon}><Icon name={opt.icon} /></div>
                    <div className={styles.deliveryInfo}>
                      <span className={styles.deliveryName}>{opt.label}</span>
                      <span className={styles.deliveryDesc}>{opt.desc}</span>
                    </div>
                    <span className={styles.deliveryPrice}>
                      {opt.price === 0 ? 'Безкоштовно' : `${opt.price} ₴`}
                    </span>
                  </label>
                ))}
              </div>

              {delivery !== 'pickup' && (
                <div className={styles.deliveryFields}>
                  <div className={styles.group}>
                    <label className={styles.label}>Місто <span className={styles.required}>*</span></label>
                    <input className={styles.input} type="text" placeholder="Київ, Львів, Одеса..." value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div className={styles.group}>
                    <label className={styles.label}>
                      {delivery === 'nova-poshta' ? 'Відділення Нової Пошти' : 'Поштовий індекс'} <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder={delivery === 'nova-poshta' ? 'Відділення №1, вул. ...' : '01001'}
                      value={warehouse}
                      onChange={e => setWarehouse(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.stepNav}>
                <button className={styles.backBtn} type="button" onClick={() => setStep('contact')}>
                  <Icon name="arrow_back" /> Назад
                </button>
                <button className={styles.nextBtn} type="button" onClick={() => {
                  if (delivery === 'pickup' || (city && warehouse)) setStep('payment');
                }}>
                  Далі <Icon name="arrow_forward" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <form className={styles.stepContent} onSubmit={handleSubmit}>
              <h3 className={styles.sectionTitle}>
                <Icon name="payment" /> Оплата
              </h3>

              <div className={styles.paymentOptions}>
                <label className={`${styles.paymentCard} ${payment === 'card' ? styles.paymentCardActive : ''}`}>
                  <input type="radio" name="payment" value="card" checked={payment === 'card'} onChange={() => setPayment('card')} className={styles.radioHidden} />
                  <Icon name="credit_card" />
                  <span>Картка</span>
                </label>
                <label className={`${styles.paymentCard} ${payment === 'cash' ? styles.paymentCardActive : ''}`}>
                  <input type="radio" name="payment" value="cash" checked={payment === 'cash'} onChange={() => setPayment('cash')} className={styles.radioHidden} />
                  <Icon name="payments" />
                  <span>Накладний платіж</span>
                </label>
              </div>

              {payment === 'card' && (
                <div className={styles.cardForm}>
                  <div className={styles.cardHeader}>
                    <Icon name="lock" />
                    <span>Безпечна оплата</span>
                    <div className={styles.cardLogos}>
                      <svg viewBox="0 0 38 24" width="38" height="24"><rect fill="#252525" width="38" height="24" rx="4"/><text x="19" y="15" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">VISA</text></svg>
                      <svg viewBox="0 0 38 24" width="38" height="24"><rect fill="#252525" width="38" height="24" rx="4"/><circle cx="15" cy="12" r="7" fill="#EB001B" opacity=".8"/><circle cx="23" cy="12" r="7" fill="#F79E1B" opacity=".8"/></svg>
                    </div>
                  </div>
                  <div className={styles.group}>
                    <label className={styles.label}>Номер картки</label>
                    <input
                      className={`${styles.input} ${styles.cardInput}`}
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCard(e.target.value))}
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className={styles.cardRow}>
                    <div className={styles.group}>
                      <label className={styles.label}>Термін дії</label>
                      <input
                        className={`${styles.input} ${styles.cardInput}`}
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className={styles.group}>
                      <label className={styles.label}>CVC</label>
                      <input
                        className={`${styles.input} ${styles.cardInput}`}
                        type="text"
                        placeholder="123"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {payment === 'cash' && (
                <div className={styles.cashNote}>
                  <Icon name="info" />
                  <p>Оплата при отриманні. Вартість доставки може змінюватися залежно від ваги посилки.</p>
                </div>
              )}

              <div className={styles.stepNav}>
                <button className={styles.backBtn} type="button" onClick={() => setStep('delivery')}>
                  <Icon name="arrow_back" /> Назад
                </button>
                <button className={styles.submitBtn} type="submit">
                  <Icon name="lock" />
                  Оплатити {total} ₴
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar summary */}
        <div className={styles.summary}>
          <h3 className={styles.sectionTitle}>Ваше замовлення</h3>
          <div className={styles.summaryList}>
            {cartBooks.map(({ book, quantity }) => (
              <div key={book.id} className={styles.summaryItem}>
                <img src={book.coverUrl} alt="" className={styles.summaryImg} />
                <div className={styles.summaryInfo}>
                  <span className={styles.summaryName}>{book.title}</span>
                  <span className={styles.summaryQty}>{quantity} x {getEffectivePrice(book)} ₴</span>
                </div>
                <span className={styles.summaryPrice}>{getEffectivePrice(book) * quantity} ₴</span>
              </div>
            ))}
          </div>
          {/* Promo code */}
          <div className={styles.promoBlock}>
            <div className={styles.promoRow}>
              <input className={styles.promoInput} type="text" placeholder="Промокод" value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }} />
              <button className={styles.promoBtn} type="button" onClick={handleApplyPromo} disabled={!promoCode.trim()}>
                Застосувати
              </button>
            </div>
            {promoError && <span className={styles.promoError}>{promoError}</span>}
            {promoDiscount && <span className={styles.promoSuccess}><Icon name="check_circle" /> {promoDiscount.code}: -{promoAmount} ₴</span>}
          </div>

          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Товари</span><span>{subtotal} ₴</span>
            </div>
            {promoAmount > 0 && (
              <div className={styles.summaryRow} style={{ color: '#10B981' }}>
                <span>Промокод ({promoDiscount?.code})</span><span>-{promoAmount} ₴</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Доставка</span>
              <span>{deliveryCost === 0 ? 'Безкоштовно' : `${deliveryCost} ₴`}</span>
            </div>
          </div>
          <div className={styles.summaryTotal}>
            <span>Разом</span><span>{total} ₴</span>
          </div>
        </div>
      </div>
    </>
  );
}
