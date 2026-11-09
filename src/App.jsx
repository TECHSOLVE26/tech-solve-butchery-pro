import { useEffect, useState, useCallback } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const money = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const number = (value) =>
  new Intl.NumberFormat('en-KE', {
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const getTodayRange = () => {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    date: [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-'),
  }
}

const emptyProductForm = {
  name: '',
  category: 'Beef',
  unit: 'kg',
  buying_price: '',
  selling_price: '',
  stock_quantity: '',
  low_stock_level: '5',
}

const categories = [
  'Beef',
  'Goat',
  'Sheep',
  'Chicken',
  'Camel',
  'Offals',
  'Processed Meat',
  'Other',
]

const emptyCustomerForm = { name: '', phone: '' }
const emptySupplierForm = { name: '', phone: '', address: '' }
const emptyExpenseForm = {
  amount: '',
  category: 'Other',
  description: '',
  expense_date: getTodayRange().date,
}
function App() {
  const [session, setSession] = useState(null)
  const [business, setBusiness] = useState(null)
const [isAdmin, setIsAdmin] = useState(false)
const [paymentRequests, setPaymentRequests] = useState([])
const [adminLoading, setAdminLoading] = useState(false)
const [adminError, setAdminError] = useState('')

  const [subscription, setSubscription] = useState(null)
const [planInfo, setPlanInfo] = useState(null)
const [availablePlans, setAvailablePlans] = useState([])
// PAYMENT REQUEST FORM
const [selectedPlan, setSelectedPlan] = useState('standard')
const [paymentPhone, setPaymentPhone] = useState('')
const [mpesaCode, setMpesaCode] = useState('')
const [paymentSubmitting, setPaymentSubmitting] = useState(false)
const [paymentMessage, setPaymentMessage] = useState('')
const [subscriptionLoading, setSubscriptionLoading] = useState(false)
const [subscriptionError, setSubscriptionError] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    email: '',
    address: '',
    currency: 'KES',
  })

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [activePage, setActivePage] = useState('overview')

  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState('')
  const [dashboard, setDashboard] = useState({
    todaySales: 0,
    transactions: 0,
    productCount: 0,
    stockQuantity: 0,
    lowStock: [],
    todayExpenses: 0,
    recentSales: [],
  })

  // PRODUCTS
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [productMessage, setProductMessage] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)

  // SALES AND RECEIPTS
  const [cart, setCart] = useState([])
  const [cartDiscount, setCartDiscount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [saleSaving, setSaleSaving] = useState(false)
  const [saleError, setSaleError] = useState('')
  const [saleMessage, setSaleMessage] = useState('')
  const [completedReceipt, setCompletedReceipt] = useState(null)
  const [salesHistory, setSalesHistory] = useState([])
  const [salesHistoryLoading, setSalesHistoryLoading] = useState(false)
  const [salesSearch, setSalesSearch] = useState('')

  // POS CUSTOMER SELECTION
  const [posCustomerId, setPosCustomerId] = useState('')

  // CUSTOMERS
  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customerSaving, setCustomerSaving] = useState(false)
  const [customerError, setCustomerError] = useState('')
  const [customerMessage, setCustomerMessage] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSales, setCustomerSales] = useState([])
  const [customerSalesLoading, setCustomerSalesLoading] = useState(false)

  // SUPPLIERS
  const [suppliers, setSuppliers] = useState([])
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [supplierSaving, setSupplierSaving] = useState(false)
  const [supplierError, setSupplierError] = useState('')
  const [supplierMessage, setSupplierMessage] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm)
// EXPENSES
const [expenses, setExpenses] = useState([])
const [expensesLoading, setExpensesLoading] = useState(false)
const [expenseSaving, setExpenseSaving] = useState(false)
const [expenseError, setExpenseError] = useState('')
const [expenseMessage, setExpenseMessage] = useState('')
const [expenseSearch, setExpenseSearch] = useState('')
const [showExpenseForm, setShowExpenseForm] = useState(false)
const [editingExpense, setEditingExpense] = useState(null)
const [expenseForm, setExpenseForm] = useState(emptyExpenseForm)
// REPORTS STATES
const [reportPeriod, setReportPeriod] = useState('month')
const [reportSales, setReportSales] = useState([])
const [reportSaleItems, setReportSaleItems] = useState([])
const [reportExpenses, setReportExpenses] = useState([])
const [reportLoading, setReportLoading] = useState(false)
const [reportError, setReportError] = useState('')
  const posCustomer =
    customers.find((customer) => customer.id === posCustomerId) || null
    // REPORT CALCULATIONS
const reportTotalSales = reportSales.reduce(
  (sum, sale) => sum + Number(sale.total || 0),
  0
)

const reportPaidSales = reportSales
  .filter((sale) => sale.payment_status === 'Paid')
  .reduce((sum, sale) => sum + Number(sale.total || 0), 0)

const reportPendingSales = reportSales
  .filter((sale) => sale.payment_status !== 'Paid')
  .reduce((sum, sale) => sum + Number(sale.total || 0), 0)

const reportTotalExpenses = reportExpenses.reduce(
  (sum, expense) => sum + Number(expense.amount || 0),
  0
)

const reportCostOfGoods = reportSaleItems.reduce(
  (sum, item) =>
    sum + Number(item.quantity || 0) * Number(item.buying_price || 0),
  0
)

const reportHasMissingCosts = reportSaleItems.some(
  (item) => item.buying_price === null || item.buying_price === undefined
)

const reportGrossProfit = reportTotalSales - reportCostOfGoods

const reportNetProfit = reportGrossProfit - reportTotalExpenses

  // LOAD BUSINESS REPORTS
const loadReports = useCallback(async () => {
  if (!business?.id) return

  setReportLoading(true)
  setReportError('')

  try {
    const now = new Date()
    const startDate = new Date(now)
    const endDate = new Date(now)

    if (reportPeriod === 'today') {
      startDate.setHours(0, 0, 0, 0)
      endDate.setDate(endDate.getDate() + 1)
      endDate.setHours(0, 0, 0, 0)
    } else if (reportPeriod === 'week') {
      const day = startDate.getDay()
      startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1))
      startDate.setHours(0, 0, 0, 0)
      endDate.setTime(startDate.getTime())
      endDate.setDate(endDate.getDate() + 7)
    } else if (reportPeriod === 'month') {
      startDate.setDate(1)
      startDate.setHours(0, 0, 0, 0)
      endDate.setMonth(startDate.getMonth() + 1)
      endDate.setDate(1)
      endDate.setHours(0, 0, 0, 0)
    }

    let salesQuery = supabase
      .from('sales')
      .select('id, total, subtotal, discount, payment_status, created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    let expensesQuery = supabase
      .from('expenses')
      .select('id, amount, category, description, expense_date')
      .eq('business_id', business.id)
      .order('expense_date', { ascending: false })

    if (reportPeriod !== 'all') {
      salesQuery = salesQuery
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())

      expensesQuery = expensesQuery
        .gte('expense_date', startDate.toISOString().slice(0, 10))
        .lt('expense_date', endDate.toISOString().slice(0, 10))
    }

    const [
      { data: sales, error: salesError },
      { data: expenses, error: expensesError },
    ] = await Promise.all([salesQuery, expensesQuery])

    if (salesError) throw salesError
    if (expensesError) throw expensesError

    const saleIds = (sales || []).map((sale) => sale.id)
    let saleItems = []

    if (saleIds.length > 0) {
      const { data, error } = await supabase
        .from('sale_items')
        .select('sale_id, quantity, unit_price, line_total, buying_price')
        .in('sale_id', saleIds)

      if (error) throw error
      saleItems = data || []
    }

    setReportSales(sales || [])
    setReportSaleItems(saleItems)
    setReportExpenses(expenses || [])
  } catch (err) {
    setReportError(err.message || 'Unable to load business reports.')
  } finally {
    setReportLoading(false)
  }
}, [business?.id, reportPeriod])

// LOAD EXPENSES
const loadExpenses = useCallback(async () => {
  if (!business?.id) return

  setExpensesLoading(true)
  setExpenseError('')

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('id, business_id, amount, category, description, expense_date')
      .eq('business_id', business.id)
      .order('expense_date', { ascending: false })

    if (error) throw error

    setExpenses(data || [])
  } catch (err) {
    setExpenseError(err.message || 'Unable to load expenses.')
  } finally {
    setExpensesLoading(false)
  }
}, [business?.id])

// LOAD SESSION
useEffect(() => {
  let mounted = true

  const loadSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (!mounted) return

    if (error) setError(error.message)

    setSession(data?.session ?? null)
    setLoading(false)
  }

  loadSession()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, currentSession) => {
    setSession(currentSession)
  })

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [])

  // LOAD BUSINESS
  useEffect(() => {
    if (!session?.user?.id) {
      setBusiness(null)
      return
    }

    let active = true

    const loadBusiness = async () => {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        setError(error.message)
      } else {
        setBusiness(data)

        if (!data) {
          setForm((previous) => ({
            ...previous,
            email: session.user.email || '',
          }))
        }
      }

      setLoading(false)
    }

    loadBusiness()

    return () => {
      active = false
    }
  }, [session?.user?.id, session?.user?.email])
  // LOAD ADMIN ROLE
useEffect(() => {
  let active = true

  const loadAdminRole = async () => {
   if (!session?.user?.id) {
  setIsAdmin(false)
  setAdminLoading(false)
  return
}

    setAdminLoading(true)
    setAdminError('')

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (!active) return

    if (error) {
      setIsAdmin(false)
      setAdminError(error.message)
    } else {
      setIsAdmin(data?.role === 'admin')
    }

    setAdminLoading(false)
  }

  loadAdminRole()

  return () => {
    active = false
  }
}, [session?.user?.id])

// SUBMIT M-PESA PAYMENT REQUEST
const submitPaymentRequest = async (event) => {
  event.preventDefault()

  if (!business?.id) {
    setPaymentMessage('Business account not found. Please log in again.')
    return
  }

  if (!paymentPhone.trim() || !mpesaCode.trim()) {
    setPaymentMessage('Please enter your M-Pesa phone number and transaction code.')
    return
  }

  setPaymentSubmitting(true)
  setPaymentMessage('')

  try {
    const { error } = await supabase
      .from('payment_requests')
      .insert({
        business_id: business.id,
        requested_plan: selectedPlan,
        mpesa_phone: paymentPhone.trim(),
        mpesa_transaction_code: mpesaCode.trim().toUpperCase(),
      })

    if (error) throw error

    setPaymentMessage(
      'Payment request submitted successfully. TECH SOLVE will verify your payment before activating your plan.'
    )

    setPaymentPhone('')
    setMpesaCode('')
  } catch (err) {
    setPaymentMessage(
      err.message || 'Unable to submit payment request. Please try again.'
    )
  } finally {
    setPaymentSubmitting(false)
  }
}
// LOAD ADMIN PAYMENT REQUESTS
const loadPaymentRequests = async () => {
  if (!isAdmin) return

  setAdminLoading(true)
  setAdminError('')

  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*, businesses(business_name)')
      .order('created_at', { ascending: false })

    if (error) throw error

    setPaymentRequests(data || [])
  } catch (err) {
    setAdminError(err.message || 'Unable to load payment requests.')
  } finally {
    setAdminLoading(false)
  }
}

// APPROVE VERIFIED M-PESA PAYMENT
const approvePaymentRequest = async (requestId) => {
  const confirmed = window.confirm(
    'Have you verified this M-Pesa transaction in your M-Pesa records?'
  )

  if (!confirmed) return

  setAdminLoading(true)
  setAdminError('')

  try {
    const { error } = await supabase.rpc(
      'approve_payment_request',
      { p_request_id: requestId }
    )

    if (error) throw error

    await loadPaymentRequests()
  } catch (err) {
    setAdminError(err.message || 'Unable to approve payment.')
  } finally {
    setAdminLoading(false)
  }
}

// REJECT PAYMENT REQUEST
const rejectPaymentRequest = async (requestId) => {
  const confirmed = window.confirm(
    'Are you sure you want to reject this payment request?'
  )

  if (!confirmed) return

  setAdminLoading(true)
  setAdminError('')

  try {
    const { error } = await supabase.rpc(
      'reject_payment_request',
      { p_request_id: requestId }
    )

    if (error) throw error

    await loadPaymentRequests()
  } catch (err) {
    setAdminError(err.message || 'Unable to reject payment request.')
  } finally {
    setAdminLoading(false)
  }
}

// AUTO-LOAD ADMIN PAYMENTS
useEffect(() => {
  if (isAdmin && activePage === 'admin-payments') {
    loadPaymentRequests()
  }
}, [isAdmin, activePage])
  // DASHBOARD
  // LOAD BUSINESS SUBSCRIPTION
const loadSubscription = useCallback(async () => {
  if (!business?.id) return

  setSubscriptionLoading(true)
  setSubscriptionError('')

  try {
    const { data: subscriptionData, error: subscriptionQueryError } =
      await supabase
        .from('subscriptions')
        .select('*')
        .eq('business_id', business.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (subscriptionQueryError) throw subscriptionQueryError

    let currentPlan = subscriptionData?.plan || 'free'

    if (
      subscriptionData?.expires_at &&
      new Date(subscriptionData.expires_at) <= new Date()
    ) {
      currentPlan = 'free'
    }

    const { data: planData, error: planQueryError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan', currentPlan.toLowerCase())
      .single()

    if (planQueryError) throw planQueryError

    setSubscription(subscriptionData)
    setPlanInfo(planData)
    const { data: plansData, error: plansError } = await supabase
  .from('subscription_plans')
  .select('*')
  .order('price', { ascending: true })

if (plansError) throw plansError

setAvailablePlans(plansData || [])
  } catch (err) {
    setSubscriptionError(
      err.message || 'Unable to load subscription information.'
    )
  } finally {
    setSubscriptionLoading(false)
  }
}, [business?.id])

// DASHBOARD
  const loadDashboard = useCallback(async () => {
    if (!business?.id) return

    setDashboardLoading(true)
    setDashboardError('')

    try {
      const { start, end, date } = getTodayRange()

      const [
        salesResult,
        productsResult,
        expensesResult,
        recentSalesResult,
      ] = await Promise.all([
        supabase
          .from('sales')
          .select('id, total, payment_status')
          .eq('business_id', business.id)
          .gte('created_at', start)
          .lt('created_at', end),

        supabase
          .from('products')
          .select(
            'id, name, category, stock_quantity, low_stock_level, unit, selling_price'
          )
          .eq('business_id', business.id)
          .order('name'),

        supabase
          .from('expenses')
          .select('id, amount')
          .eq('business_id', business.id)
          .eq('expense_date', date),

        supabase
          .from('sales')
          .select(
            'id, receipt_number, total, payment_method, payment_status, created_at'
          )
          .eq('business_id', business.id)
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      const failed = [
        salesResult,
        productsResult,
        expensesResult,
        recentSalesResult,
      ].find((result) => result.error)

      if (failed) throw failed.error

      const sales = salesResult.data || []
      const productRows = productsResult.data || []
      const expenses = expensesResult.data || []
      const recentSales = recentSalesResult.data || []

      const paidSales = sales.filter(
        (sale) => sale.payment_status?.toLowerCase() === 'paid'
      )

      const todaySales = paidSales.reduce(
        (sum, sale) => sum + Number(sale.total || 0),
        0
      )

      const todayExpenses = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      )

      const lowStock = productRows.filter(
        (product) =>
          Number(product.stock_quantity || 0) <=
          Number(product.low_stock_level || 0)
      )

      const stockQuantity = productRows.reduce(
        (sum, product) => sum + Number(product.stock_quantity || 0),
        0
      )

      setDashboard({
        todaySales,
        transactions: sales.length,
        productCount: productRows.length,
        stockQuantity,
        lowStock,
        todayExpenses,
        recentSales,
      })
    } catch (err) {
      setDashboardError(err.message || 'Unable to load dashboard data.')
    } finally {
      setDashboardLoading(false)
    }
  }, [business?.id])

  useEffect(() => {
  if (business?.id) {
    loadDashboard()
    loadSubscription()
  }
}, [business?.id, loadDashboard, loadSubscription])
  // LOAD PRODUCTS
  const loadProducts = useCallback(async () => {
    if (!business?.id) return

    setProductsLoading(true)
    setProductsError('')

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', business.id)
      .order('name', { ascending: true })

    if (error) {
      setProductsError(error.message)
    } else {
      setProducts(data || [])
    }

    setProductsLoading(false)
  }, [business?.id])

  useEffect(() => {
    if (
      business?.id &&
      (activePage === 'products' || activePage === 'sales')
    ) {
      loadProducts()
    }
  }, [business?.id, activePage, loadProducts])

  // LOAD SALES HISTORY
  const loadSalesHistory = useCallback(async () => {
    if (!business?.id) return

    setSalesHistoryLoading(true)
    setSaleError('')

    const { data, error } = await supabase
      .from('sales')
      .select(
        'id, customer_id, receipt_number, subtotal, discount, total, payment_method, payment_status, created_at'
      )
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      setSaleError(error.message)
    } else {
      setSalesHistory(data || [])
    }

    setSalesHistoryLoading(false)
  }, [business?.id])

  useEffect(() => {
  if (
    business?.id &&
    (activePage === 'sales' || activePage === 'reports')
  ) {
    loadSalesHistory()
  }
}, [business?.id, activePage, loadSalesHistory])

  // LOAD CUSTOMERS
  const loadCustomers = useCallback(async () => {
    if (!business?.id) return

    setCustomersLoading(true)
    setCustomerError('')

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, business_id, name, phone, created_at')
        .eq('business_id', business.id)
        .order('name', { ascending: true })

      if (error) throw error

      setCustomers(data || [])
    } catch (err) {
      setCustomerError(err.message || 'Unable to load customers.')
    } finally {
      setCustomersLoading(false)
    }
  }, [business?.id])

  // LOAD CUSTOMER SALES HISTORY
  const loadCustomerSales = useCallback(
    async (customer) => {
      if (!business?.id || !customer?.id) return

      setCustomerSalesLoading(true)
      setCustomerError('')

      try {
        const { data, error } = await supabase
          .from('sales')
          .select(
            'id, receipt_number, subtotal, discount, total, payment_method, payment_status, created_at'
          )
          .eq('business_id', business.id)
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        setCustomerSales(data || [])
      } catch (err) {
        setCustomerError(err.message || 'Unable to load customer sales.')
        setCustomerSales([])
      } finally {
        setCustomerSalesLoading(false)
      }
    },
    [business?.id]
  )

  useEffect(() => {
    if (
      business?.id &&
      (activePage === 'customers' || activePage === 'sales')
    ) {
      loadCustomers()
    }
  }, [business?.id, activePage, loadCustomers])

  // LOAD SUPPLIERS
  const loadSuppliers = useCallback(async () => {
    if (!business?.id) return

    setSuppliersLoading(true)
    setSupplierError('')

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_id, name, phone, address, created_at')
        .eq('business_id', business.id)
        .order('name', { ascending: true })

      if (error) throw error

      setSuppliers(data || [])
    } catch (err) {
      setSupplierError(err.message || 'Unable to load suppliers.')
    } finally {
      setSuppliersLoading(false)
    }
  }, [business?.id])

  useEffect(() => {
    if (business?.id && activePage === 'suppliers') {
      loadSuppliers()
    }
  }, [business?.id, activePage, loadSuppliers])

  // AUTHENTICATION
  const handleAuth = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error
        setMessage('Sign in successful.')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        })

        if (error) throw error

        if (data.session) {
          setMessage('Your account has been created successfully.')
        } else {
          setMessage(
            'Account created. Please check your email and confirm your account.'
          )
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setSaving(false)
    }
  }

  // LOGOUT
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
    } else {
      setSession(null)
      setBusiness(null)
      setPassword('')
      setMessage('')
      setError('')
      setActivePage('overview')
      setCart([])
      setPosCustomerId('')
      setCompletedReceipt(null)
      setCustomers([])
      setSelectedCustomer(null)
      setCustomerSales([])
      setSuppliers([])
    }
  }

  // BUSINESS FORM
  const updateField = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  // REGISTER BUSINESS
  const handleBusinessSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!form.business_name.trim()) {
      setError('Please enter your butchery business name.')
      return
    }

    if (!session?.user?.id) {
      setError('Your session has expired.')
      return
    }

    setSaving(true)

    const businessData = {
      owner_id: session.user.id,
      business_name: form.business_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || session.user.email,
      address: form.address.trim() || null,
      currency: 'KES',
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setBusiness(data)
      setMessage('Your butchery business has been registered successfully.')
    }

    setSaving(false)
  }

  // PRODUCT FORM
  const updateProductField = (event) => {
    const { name, value } = event.target

    setProductForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const openNewProductForm = () => {
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setProductMessage('')
    setProductsError('')
    setShowProductForm(true)
  }

  const openEditProductForm = (product) => {
    setEditingProduct(product)
    setProductMessage('')
    setProductsError('')

    setProductForm({
      name: product.name || '',
      category: product.category || 'Beef',
      unit: product.unit || 'kg',
      buying_price: String(product.buying_price ?? 0),
      selling_price: String(product.selling_price ?? 0),
      stock_quantity: String(product.stock_quantity ?? 0),
      low_stock_level: String(product.low_stock_level ?? 5),
    })

    setShowProductForm(true)
  }

  const closeProductForm = () => {
    setShowProductForm(false)
    setEditingProduct(null)
    setProductForm(emptyProductForm)
  }

  // SAVE PRODUCT
  const handleProductSubmit = async (event) => {
    event.preventDefault()
    setProductsError('')
    setProductMessage('')

    if (!business?.id) {
      setProductsError('Business account not found.')
      return
    }

    const name = productForm.name.trim()
    const buyingPrice = Number(productForm.buying_price)
    const sellingPrice = Number(productForm.selling_price)
    const stockQuantity = Number(productForm.stock_quantity)
    const lowStockLevel = Number(productForm.low_stock_level)

    const numericValues = [
      buyingPrice,
      sellingPrice,
      stockQuantity,
      lowStockLevel,
    ]

    if (!name) {
      setProductsError('Please enter the product name.')
      return
    }

    if (
      numericValues.some(
        (value) => !Number.isFinite(value) || value < 0
      )
    ) {
      setProductsError('Enter valid non-negative prices and stock values.')
      return
    }

    setSaving(true)

    const productData = {
      business_id: business.id,
      name,
      category: productForm.category,
      unit: productForm.unit,
      buying_price: buyingPrice,
      selling_price: sellingPrice,
      stock_quantity: stockQuantity,
      low_stock_level: lowStockLevel,
    }

    try {
      if (editingProduct) {
        const oldStock = Number(editingProduct.stock_quantity || 0)
        const difference = stockQuantity - oldStock

        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .eq('business_id', business.id)

        if (error) throw error

        if (difference !== 0) {
          const { error: movementError } = await supabase
            .from('stock_movements')
            .insert({
              business_id: business.id,
              product_id: editingProduct.id,
              movement_type: 'adjustment',
              quantity: difference,
              notes: 'Stock quantity changed from the product edit form.',
            })

          if (movementError) {
            setProductMessage(
              'Product updated, but stock history could not be recorded: ' +
                movementError.message
            )
          } else {
            setProductMessage('Product and stock updated successfully.')
          }
        } else {
          setProductMessage('Product updated successfully.')
        }
      } else {

  // CHECK THE BUSINESS SUBSCRIPTION
  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('plan, status, expires_at')
    .eq('business_id', business.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) throw subscriptionError

  let currentPlan = subscription?.plan || 'free'

  if (
    subscription?.expires_at &&
    new Date(subscription.expires_at) <= new Date()
  ) {
    currentPlan = 'free'
  }

  // GET THE PLAN PRODUCT LIMIT
  const { data: planInfo, error: planError } = await supabase
    .from('subscription_plans')
    .select('product_limit')
    .eq('plan', currentPlan)
    .single()

  if (planError) throw planError

  // COUNT EXISTING PRODUCTS
  if (planInfo.product_limit !== null) {
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id)

    if (countError) throw countError

    if ((count ?? 0) >= planInfo.product_limit) {
      setProductMessage(
        `Your ${currentPlan.toUpperCase()} plan allows only ${planInfo.product_limit} products. Upgrade your plan to add more.`
      )
      return
    }
  }

  // NOW SAVE THE NEW PRODUCT
  const { data: newProduct, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()

  if (error) throw error

        if (error) throw error

        if (stockQuantity > 0) {
          const { error: movementError } = await supabase
            .from('stock_movements')
            .insert({
              business_id: business.id,
              product_id: newProduct.id,
              movement_type: 'opening_stock',
              quantity: stockQuantity,
              notes: 'Opening stock recorded when the product was created.',
            })

          if (movementError) {
            setProductMessage(
              'Product saved, but opening stock history could not be recorded: ' +
                movementError.message
            )
          } else {
            setProductMessage('Product added successfully.')
          }
        } else {
          setProductMessage('Product added successfully.')
        }
      }

      closeProductForm()
      await loadProducts()
      await loadDashboard()
    } catch (err) {
      setProductsError(err.message || 'Unable to save this product.')
    } finally {
      setSaving(false)
    }
  }

  // DELETE PRODUCT
  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setProductsError('')
    setProductMessage('')
    setSaving(true)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)
      .eq('business_id', business.id)

    if (error) {
      setProductsError(
        'Unable to delete this product. It may already be linked to sales or stock history. ' +
          error.message
      )
    } else {
      setProductMessage('Product deleted successfully.')
      await loadProducts()
      await loadDashboard()
    }

    setSaving(false)
  }

  // SALES CART
  const addToCart = (product) => {
    setSaleError('')
    setSaleMessage('')
    setCompletedReceipt(null)

    if (Number(product.stock_quantity) <= 0) {
      setSaleError(`${product.name} is out of stock.`)
      return
    }

    setCart((previous) => {
      const existing = previous.find(
        (item) => item.product_id === product.id
      )

      if (existing) {
        if (
          Number(existing.quantity) + 1 >
          Number(product.stock_quantity)
        ) {
          setSaleError(`Not enough stock for ${product.name}.`)
          return previous
        }

        return previous.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: Number(item.quantity) + 1 }
            : item
        )
      }

      return [
        ...previous,
        {
          product_id: product.id,
          name: product.name,
          category: product.category,
          unit: product.unit,
          quantity: 1,
          unit_price: Number(product.selling_price),
          available_stock: Number(product.stock_quantity),
        },
      ]
    })
  }

  const updateCartQuantity = (productId, newQuantity) => {
    const quantity = Number(newQuantity)

    if (!Number.isFinite(quantity) || quantity <= 0) return

    setCart((previous) =>
      previous.map((item) => {
        if (item.product_id !== productId) return item

        if (quantity > item.available_stock) {
          setSaleError(
            `Only ${number(item.available_stock)} ${item.unit} available for ${item.name}.`
          )
          return item
        }

        setSaleError('')
        return { ...item, quantity }
      })
    )
  }

  const removeFromCart = (productId) => {
    setCart((previous) =>
      previous.filter((item) => item.product_id !== productId)
    )
    setSaleError('')
  }

  const clearCart = () => {
    setCart([])
    setCartDiscount('')
    setPosCustomerId('')
    setSaleError('')
    setSaleMessage('')
  }

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  const discountValue = Number(cartDiscount || 0)
  const safeDiscount =
    Number.isFinite(discountValue) && discountValue >= 0
      ? discountValue
      : 0

  const cartTotal = Math.max(0, cartSubtotal - safeDiscount)

  // COMPLETE SALE
  const completeSale = async (event) => {
    event.preventDefault()
    setSaleError('')
    setSaleMessage('')

    if (!business?.id) {
      setSaleError('Business account not found.')
      return
    }

    if (cart.length === 0) {
      setSaleError('Add at least one product to the cart.')
      return
    }

    if (!Number.isFinite(discountValue) || discountValue < 0) {
      setSaleError('Enter a valid discount.')
      return
    }

    if (safeDiscount > cartSubtotal) {
      setSaleError('Discount cannot exceed the sale subtotal.')
      return
    }

    const selectedPosCustomer =
      customers.find((customer) => customer.id === posCustomerId) || null

    if (posCustomerId && !selectedPosCustomer) {
      setSaleError(
        'The selected customer could not be found. Refresh customers and select again.'
      )
      return
    }

    const items = cart.map((item) => ({
      product_id: item.product_id,
      quantity: Number(item.quantity),
    }))

    setSaleSaving(true)

    try {
      const { data, error } = await supabase.rpc(
        'create_butchery_sale',
        {
          p_business_id: business.id,
          p_items: items,
          p_payment_method: paymentMethod,
          p_payment_status: paymentStatus,
          p_discount: safeDiscount,
          p_customer_id: selectedPosCustomer?.id || null,
        }
      )

      if (error) throw error

      const sale = Array.isArray(data) ? data[0] : data

      if (!sale?.sale_id) {
        throw new Error(
          'The sale was submitted, but the receipt details were not returned. Check your sales records before trying again.'
        )
      }

      const receipt = {
        ...sale,
        customer_id: selectedPosCustomer?.id || null,
        customer_name: selectedPosCustomer?.name || null,
        customer_phone: selectedPosCustomer?.phone || null,
        items: cart.map((item) => ({
          ...item,
          line_total: item.quantity * item.unit_price,
        })),
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        business_name: business.business_name,
        business_phone: business.phone,
        business_address: business.address,
        created_at: new Date().toISOString(),
      }

      setCompletedReceipt(receipt)
      setSaleMessage('Sale completed successfully.')
      setCart([])
      setCartDiscount('')
      setPosCustomerId('')

      await Promise.all([
        loadProducts(),
        loadDashboard(),
        loadSalesHistory(),
      ])
    } catch (err) {
      setSaleError(err.message || 'Unable to complete the sale.')
    } finally {
      setSaleSaving(false)
    }
  }

  // PRINT RECEIPT
  const printReceipt = () => {
    window.print()
  }

  // OPEN A PAST RECEIPT
  const openPastReceipt = async (sale) => {
    setSaleError('')
    setSaleMessage('')

    const { data, error } = await supabase
      .from('sale_items')
      .select('id, product_name, quantity, unit_price, line_total')
      .eq('sale_id', sale.id)

    if (error) {
      setSaleError(error.message)
      return
    }

    let receiptCustomer = null

    if (sale.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name, phone')
        .eq('id', sale.customer_id)
        .eq('business_id', business.id)
        .maybeSingle()

      if (!customerError) {
        receiptCustomer = customerData
      }
    }

    setCompletedReceipt({
      ...sale,
      sale_id: sale.id,
      customer_id: sale.customer_id || null,
      customer_name: receiptCustomer?.name || null,
      customer_phone: receiptCustomer?.phone || null,
      items: data || [],
      business_name: business.business_name,
      business_phone: business.phone,
      business_address: business.address,
    })
  }

  // CUSTOMER FORM
  const openNewCustomerForm = () => {
    setEditingCustomer(null)
    setCustomerForm(emptyCustomerForm)
    setCustomerError('')
    setCustomerMessage('')
    setShowCustomerForm(true)
  }

  const openEditCustomerForm = (customer) => {
    setEditingCustomer(customer)
    setCustomerForm({
      name: customer.name || '',
      phone: customer.phone || '',
    })
    setCustomerError('')
    setCustomerMessage('')
    setShowCustomerForm(true)
  }

  const closeCustomerForm = () => {
    setShowCustomerForm(false)
    setEditingCustomer(null)
    setCustomerForm(emptyCustomerForm)
  }

  // SAVE CUSTOMER
  const handleCustomerSubmit = async (event) => {
    event.preventDefault()
    setCustomerError('')
    setCustomerMessage('')

    if (!business?.id) {
      setCustomerError('Business account not found.')
      return
    }

    const name = customerForm.name.trim()
    const phone = customerForm.phone.trim()

    if (!name) {
      setCustomerError('Please enter the customer name.')
      return
    }

    setCustomerSaving(true)

    const customerData = {
      business_id: business.id,
      name,
      phone: phone || null,
    }

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id)
          .eq('business_id', business.id)

        if (error) throw error

        if (selectedCustomer?.id === editingCustomer.id) {
          setSelectedCustomer({
            ...editingCustomer,
            ...customerData,
          })
        }

        setCustomerMessage('Customer updated successfully.')
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([customerData])

        if (error) throw error

        setCustomerMessage('Customer registered successfully.')
      }

      closeCustomerForm()
      await loadCustomers()
    } catch (err) {
      setCustomerError(err.message || 'Unable to save customer.')
    } finally {
      setCustomerSaving(false)
    }
  }

  // DELETE CUSTOMER
  const handleDeleteCustomer = async (customer) => {
    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    )

    if (!confirmed) return

    setCustomerError('')
    setCustomerMessage('')
    setCustomerSaving(true)

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)
        .eq('business_id', business.id)

      if (error) {
        if (error.code === '23503') {
          throw new Error(
            'This customer has sales records. Keep the customer record so the sales history is preserved.'
          )
        }

        throw error
      }

      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer(null)
        setCustomerSales([])
      }

      if (posCustomerId === customer.id) {
        setPosCustomerId('')
      }

      setCustomerMessage('Customer deleted successfully.')
      await loadCustomers()
    } catch (err) {
      setCustomerError(err.message || 'Unable to delete customer.')
    } finally {
      setCustomerSaving(false)
    }
  }

  // OPEN CUSTOMER SALES HISTORY
  const openCustomerHistory = async (customer) => {
    setSelectedCustomer(customer)
    setCustomerSales([])
    await loadCustomerSales(customer)
  }
    // EXPENSE FORM
  const openNewExpenseForm = () => {
    setEditingExpense(null)
    setExpenseForm(emptyExpenseForm)
    setExpenseError('')
    setExpenseMessage('')
    setShowExpenseForm(true)
  }

  const openEditExpenseForm = (expense) => {
    setEditingExpense(expense)
    setExpenseForm({
      amount: String(expense.amount || ''),
      category: expense.category || 'Other',
      description: expense.description || '',
      expense_date: expense.expense_date || getTodayRange().date,
    })
    setExpenseError('')
    setExpenseMessage('')
    setShowExpenseForm(true)
  }

  const closeExpenseForm = () => {
    setShowExpenseForm(false)
    setEditingExpense(null)
    setExpenseForm(emptyExpenseForm)
  }

  // SAVE EXPENSE
  const handleExpenseSubmit = async (event) => {
    event.preventDefault()
    setExpenseError('')
    setExpenseMessage('')

    if (!business?.id) {
      setExpenseError('Business account not found.')
      return
    }

    const amount = Number(expenseForm.amount)
    const category = expenseForm.category
    const description = expenseForm.description.trim()
    const expenseDate = expenseForm.expense_date

    if (!Number.isFinite(amount) || amount <= 0) {
      setExpenseError('Enter a valid expense amount greater than zero.')
      return
    }

    if (!category || !expenseDate) {
      setExpenseError('Please select a category and expense date.')
      return
    }

    const expenseData = {
      business_id: business.id,
      amount,
      category,
description: description || '',      expense_date: expenseDate,
    }

    setExpenseSaving(true)

    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id)
          .eq('business_id', business.id)

        if (error) throw error

        setExpenseMessage('Expense updated successfully.')
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData])

        if (error) throw error

        setExpenseMessage('Expense recorded successfully.')
      }

      closeExpenseForm()
      await Promise.all([loadExpenses(), loadDashboard()])
    } catch (err) {
      setExpenseError(err.message || 'Unable to save expense.')
    } finally {
      setExpenseSaving(false)
    }
  }

  // DELETE EXPENSE
  const handleDeleteExpense = async (expense) => {
    const confirmed = window.confirm(
      'Delete this expense? This action cannot be undone.'
    )

    if (!confirmed) return

    setExpenseError('')
    setExpenseMessage('')
    setExpenseSaving(true)

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expense.id)
        .eq('business_id', business.id)

      if (error) throw error

      setExpenseMessage('Expense deleted successfully.')
      await Promise.all([loadExpenses(), loadDashboard()])
    } catch (err) {
      setExpenseError(err.message || 'Unable to delete expense.')
    } finally {
      setExpenseSaving(false)
    }
  }

  // SUPPLIER FORM
  const openNewSupplierForm = () => {
    setEditingSupplier(null)
    setSupplierForm(emptySupplierForm)
    setSupplierError('')
    setSupplierMessage('')
    setShowSupplierForm(true)
  }

  const openEditSupplierForm = (supplier) => {
    setEditingSupplier(supplier)
    setSupplierForm({
      name: supplier.name || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    })
    setSupplierError('')
    setSupplierMessage('')
    setShowSupplierForm(true)
  }

  const closeSupplierForm = () => {
    setShowSupplierForm(false)
    setEditingSupplier(null)
    setSupplierForm(emptySupplierForm)
  }

  // SAVE SUPPLIER
  const handleSupplierSubmit = async (event) => {
    event.preventDefault()
    setSupplierError('')
    setSupplierMessage('')

    if (!business?.id) {
      setSupplierError('Business account not found.')
      return
    }

    const name = supplierForm.name.trim()
    const phone = supplierForm.phone.trim()
    const address = supplierForm.address.trim()

    if (!name) {
      setSupplierError('Please enter the supplier name.')
      return
    }

    setSupplierSaving(true)

    const supplierData = {
      business_id: business.id,
      name,
      phone: phone || null,
      address: address || null,
    }

    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', editingSupplier.id)
          .eq('business_id', business.id)

        if (error) throw error

        setSupplierMessage('Supplier updated successfully.')
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([supplierData])

        if (error) throw error

        setSupplierMessage('Supplier registered successfully.')
      }

      closeSupplierForm()
      await loadSuppliers()
    } catch (err) {
      setSupplierError(err.message || 'Unable to save supplier.')
    } finally {
      setSupplierSaving(false)
    }
  }

  // DELETE SUPPLIER
  const handleDeleteSupplier = async (supplier) => {
    const confirmed = window.confirm(
      `Delete supplier "${supplier.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setSupplierError('')
    setSupplierMessage('')
    setSupplierSaving(true)

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplier.id)
        .eq('business_id', business.id)

      if (error) {
        if (error.code === '23503') {
          throw new Error(
            'This supplier is linked to other records and cannot be deleted.'
          )
        }

        throw error
      }

      setSupplierMessage('Supplier deleted successfully.')
      await loadSuppliers()
    } catch (err) {
      setSupplierError(err.message || 'Unable to delete supplier.')
    } finally {
      setSupplierSaving(false)
    }
  }

  // FILTERED DATA
  const filteredProducts = products.filter((product) => {
    const search = productSearch.trim().toLowerCase()

    return (
      !search ||
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    )
  })

  const availableProducts = products.filter(
    (product) => Number(product.stock_quantity) > 0
  )

  const filteredSales = salesHistory.filter((sale) => {
    const search = salesSearch.trim().toLowerCase()

    return (
      !search ||
      sale.receipt_number?.toLowerCase().includes(search) ||
      sale.payment_method?.toLowerCase().includes(search) ||
      sale.payment_status?.toLowerCase().includes(search)
    )
  })

  const filteredCustomers = customers.filter((customer) => {
    const search = customerSearch.trim().toLowerCase()

    return (
      !search ||
      customer.name?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search)
    )
  })

 const filteredSuppliers = suppliers.filter((supplier) => {
  const search = supplierSearch.trim().toLowerCase()

  return (
    !search ||
    supplier.name?.toLowerCase().includes(search) ||
    supplier.phone?.toLowerCase().includes(search) ||
    supplier.address?.toLowerCase().includes(search)
  )
})

// EXPENSE FILTERING AND TOTALS
const filteredExpenses = expenses.filter((expense) => {
  const search = expenseSearch.trim().toLowerCase()

  return (
    !search ||
    expense.category?.toLowerCase().includes(search) ||
    expense.description?.toLowerCase().includes(search)
  )
})

const totalExpenses = expenses.reduce(
  (sum, expense) => sum + Number(expense.amount || 0),
  0
)

const todayExpensesTotal = expenses
  .filter((expense) => expense.expense_date === getTodayRange().date)
  .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

  const customerPaidTotal = customerSales
    .filter((sale) => sale.payment_status?.toLowerCase() === 'paid')
    .reduce((sum, sale) => sum + Number(sale.total || 0), 0)

  // LOADING SCREEN
  if (loading) {
    return (
      <main className="app-shell">
        <div className="loading-card">
          <div className="loading-line"></div>
          <p>Loading your workspace...</p>
        </div>
      </main>
    )
  }

  // LOGIN AND SIGNUP
  if (!session) {
    return (
      <main className="app-shell">
        <section className="login-card">
          <div className="login-top">
            <div className="login-brand-mark">TS</div>
            <div className="login-brand">
              <strong>TECH SOLVE</strong>
              <span>BUTCHERY PRO</span>
            </div>
          </div>

          <div className="login-red-line"></div>

          <div className="login-content">
            <span className="login-label">SECURE BUSINESS ACCESS</span>

            <h1>
              {authMode === 'login'
                ? 'Welcome back.'
                : 'Create your account.'}
            </h1>

            <p>
              {authMode === 'login'
                ? 'Sign in to access your Butchery Pro business workspace.'
                : 'Create your TECH SOLVE account to get started.'}
            </p>

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('login')
                  setError('')
                  setMessage('')
                }}
              >
                SIGN IN
              </button>

              <button
                type="button"
                className={authMode === 'signup' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('signup')
                  setError('')
                  setMessage('')
                }}
              >
                CREATE ACCOUNT
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <label className="field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </label>
              )}

              <label className="field">
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={
                    authMode === 'login' ? 'current-password' : 'new-password'
                  }
                  minLength={6}
                  required
                />
              </label>

              {error && <div className="alert error-alert">{error}</div>}
              {message && <div className="alert success-alert">{message}</div>}

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'PLEASE WAIT...'
                  : authMode === 'login'
                    ? 'SIGN IN TO YOUR ACCOUNT'
                    : 'CREATE MY ACCOUNT'}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  setError('')
                  setMessage('')
                }}
              >
                {authMode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>

          <footer className="login-footer">
            <span>TECH SOLVE</span>
            <span>SMART BUSINESS MANAGEMENT</span>
          </footer>
        </section>
      </main>
    )
  }

  // BUSINESS REGISTRATION
  if (!business) {
    return (
      <main className="app-shell">
        <section className="business-layout">
          <header className="business-header">
            <div className="header-brand">
              <div className="brand-mark">TS</div>
              <div>
                <strong>TECH SOLVE</strong>
                <span>BUTCHERY PRO</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              SIGN OUT
            </button>
          </header>

          <div className="red-strip"></div>

          <div className="business-content">
            <div className="setup-heading">
              <span className="setup-label">FIRST-TIME SETUP</span>
              <h1>Register your butchery.</h1>
              <p>
                Add your business details to create your private management
                workspace.
              </p>
            </div>

            <form className="business-form" onSubmit={handleBusinessSubmit}>
              <div className="form-section-title">
                <div>
                  <span className="section-number">01</span>
                  <h2>Business information</h2>
                </div>
                <span className="required-note">REQUIRED DETAILS</span>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>Business name *</span>
                  <input
                    name="business_name"
                    value={form.business_name}
                    onChange={updateField}
                    placeholder="e.g. Mombasa Fresh Butchery"
                    required
                  />
                </label>

                <label className="field">
                  <span>Business phone</span>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="Business phone number"
                  />
                </label>

                <label className="field">
                  <span>Business email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="Business email"
                  />
                </label>

                <label className="field">
                  <span>Business address</span>
                  <input
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    placeholder="Town or physical address"
                  />
                </label>
              </div>

              <div className="currency-panel">
                <div>
                  <span>DEFAULT CURRENCY</span>
                  <strong>Kenyan Shilling</strong>
                </div>
                <strong className="currency-code">KES</strong>
              </div>

              {error && <div className="alert error-alert">{error}</div>}
              {message && <div className="alert success-alert">{message}</div>}

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving ? 'REGISTERING...' : 'REGISTER MY BUSINESS'}
              </button>

              <p className="form-footnote">
                Your business information is stored securely in your account.
              </p>
            </form>

            <footer className="setup-footer">
              <span>TECH SOLVE BUTCHERY PRO</span>
              <span>SMART BUSINESS MANAGEMENT</span>
            </footer>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">TS</div>
            <div>
              <strong>TECH SOLVE</strong>
              <span>BUTCHERY PRO</span>
            </div>
          </div>

          <div className="sidebar-section-label">WORKSPACE</div>

          <button
            className={`sidebar-link ${activePage === 'overview' ? 'active' : ''}`}
            onClick={() => setActivePage('overview')}
          >
            OVERVIEW
          </button>

          <button
            className={`sidebar-link ${activePage === 'products' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('products')
              setProductMessage('')
              setProductsError('')
            }}
          >
            PRODUCTS & STOCK
          </button>

          <button
            className={`sidebar-link ${activePage === 'sales' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('sales')
              setSaleError('')
              setSaleMessage('')
            }}
          >
            SALES & RECEIPTS
          </button>

          <button
            className={`sidebar-link ${activePage === 'customers' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('customers')
              setCustomerError('')
              setCustomerMessage('')
              setSelectedCustomer(null)
              setCustomerSales([])
              setShowCustomerForm(false)
            }}
          >
            CUSTOMERS
          </button>

          <button
            className={`sidebar-link ${activePage === 'suppliers' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('suppliers')
              setSupplierError('')
              setSupplierMessage('')
              setShowSupplierForm(false)
            }}
          >
            SUPPLIERS
          </button>

                    <button
            className={`sidebar-link ${activePage === 'expenses' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('expenses')
              setExpenseError('')
              setExpenseMessage('')
              setShowExpenseForm(false)
            }}
          >
            EXPENSES
          </button>

          <button
  className={`sidebar-link ${activePage === 'reports' ? 'active' : ''}`}
  onClick={() => {
    setActivePage('reports')
    setSaleMessage('')
  }}
>
  REPORTS
</button>
{/* SUBSCRIPTION */}
<button
  className={`sidebar-link ${activePage === 'subscription' ? 'active' : ''}`}
  onClick={() => setActivePage('subscription')}
>
  SUBSCRIPTION & PLANS
</button>

{/* SETTINGS */}
{/* ADMIN PAYMENT CENTRE */}
{isAdmin && (
  <button
    className={`sidebar-link ${activePage === 'admin-payments' ? 'active' : ''}`}
    onClick={() => setActivePage('admin-payments')}
  >
    ADMIN PAYMENT CENTRE
  </button>
)}

<button
  className={`sidebar-link ${activePage === 'settings' ? 'active' : ''}`}
  onClick={() => setActivePage('settings')}
>
  SETTINGS
</button>
          <div className="sidebar-bottom">
            <span>BUSINESS ACCOUNT</span>
            <strong>{business.business_name}</strong>
            <small>{session.user.email}</small>
            <button className="logout-button" onClick={handleLogout}>
              SIGN OUT
            </button>
          </div>
        </aside>

        <div className="dashboard-main">
          {/* ADMIN PAYMENT CENTRE */}
{activePage === 'admin-payments' && isAdmin && (
  <div className="admin-payment-page">
    <header className="dashboard-header">
      <div>
        <span className="setup-label">TECH SOLVE ADMINISTRATION</span>
        <h1>Payment Centre</h1>
        <p>Review and manage customer subscription payments.</p>
      </div>

      <button
        className="refresh-button"
        onClick={loadPaymentRequests}
        disabled={adminLoading}
      >
        {adminLoading ? 'LOADING...' : 'REFRESH PAYMENTS'}
      </button>
    </header>

    {adminError && (
      <div className="alert error-alert">{adminError}</div>
    )}

<section className="stats-grid admin-payment-stats">
        <article className="stat-card">
        <span>TOTAL REQUESTS</span>
        <strong>{paymentRequests.length}</strong>
      </article>

      <article className="stat-card">
        <span>PENDING PAYMENTS</span>
        <strong>
          {paymentRequests.filter((r) => r.status === 'pending').length}
        </strong>
      </article>

      <article className="stat-card">
        <span>APPROVED PAYMENTS</span>
        <strong>
          {paymentRequests.filter((r) => r.status === 'approved').length}
        </strong>
      </article>
    </section>

<section className="dashboard-panel admin-payment-panel">
        <div className="panel-heading">
        <div>
          <span className="setup-label">CUSTOMER TRANSACTIONS</span>
          <h2>M-Pesa Payment Requests</h2>
        </div>
      </div>

      {adminLoading && <p>Loading payment requests...</p>}

      {!adminLoading && paymentRequests.length === 0 && (
        <p>No payment requests have been submitted yet.</p>
      )}

      {paymentRequests.map((request) => (
        <article
  key={request.id}
  style={{
    border: '1px solid #e5e5e5',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '16px',
  }}
>
          <h3>
            {request.businesses?.business_name || 'Business account'}
          </h3>

          <p>Plan: {request.requested_plan.toUpperCase()}</p>
          <p>Amount: {money(request.amount)}</p>
          <p>M-Pesa phone: {request.mpesa_phone}</p>
          <p>Transaction code: <strong>{request.mpesa_transaction_code}</strong></p>
          <p>
            Submitted: {new Date(request.created_at).toLocaleString('en-KE')}
          </p>
          <p>
            Status: <strong>{request.status.toUpperCase()}</strong>
          </p>
{request.status === 'pending' && (
  <>
    <button
      className="refresh-button"
      disabled={adminLoading}
      onClick={() => approvePaymentRequest(request.id)}
    >
      APPROVE VERIFIED PAYMENT
    </button>

    <button
      className="refresh-button"
      disabled={adminLoading}
      onClick={() => rejectPaymentRequest(request.id)}
    >
      REJECT PAYMENT
    </button>
  </>
)}
        </article>
      ))}
    </section>
    </div>
)}

          {/* OVERVIEW */}
          {activePage === 'overview' && (
            <>
              <header className="dashboard-header">
                <div>
                  <span className="setup-label">BUSINESS OVERVIEW</span>
                  <h1>{business.business_name}</h1>
                  <p>Here's what's happening in your butchery today.</p>
                </div>

                <button
                  className="refresh-button"
                  onClick={loadDashboard}
                  disabled={dashboardLoading}
                >
                  {dashboardLoading ? 'REFRESHING...' : 'REFRESH DATA'}
                </button>
              </header>

              {dashboardError && (
                <div className="alert error-alert">{dashboardError}</div>
              )}

              <div className="dashboard-date">
                <span>DAILY PERFORMANCE</span>
                <strong>
                  {new Date().toLocaleDateString('en-KE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </div>

<section className="stats-grid admin-payment-stats">
                  <article className="stat-card sales-stat">
                  <span>TODAY'S PAID SALES</span>
                  <strong>
                    {dashboardLoading ? '...' : money(dashboard.todaySales)}
                  </strong>
                  <small>Payments marked as Paid</small>
                </article>

                <article className="stat-card">
                  <span>TRANSACTIONS TODAY</span>
                  <strong>
                    {dashboardLoading ? '...' : number(dashboard.transactions)}
                  </strong>
                  <small>All recorded sales today</small>
                </article>

                <article className="stat-card">
                  <span>REGISTERED PRODUCTS</span>
                  <strong>
                    {dashboardLoading ? '...' : number(dashboard.productCount)}
                  </strong>
                  <small>Products in your catalogue</small>
                </article>

                <article className="stat-card">
                  <span>TOTAL STOCK</span>
                  <strong>
                    {dashboardLoading ? '...' : number(dashboard.stockQuantity)}
                  </strong>
                  <small>Combined recorded quantity</small>
                </article>
              </section>

              <section className="dashboard-lower-grid">
                <article className="dashboard-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="setup-label">STOCK CONTROL</span>
                      <h2>Low-stock alerts</h2>
                    </div>
                    <span className="panel-count">
                      {dashboardLoading ? '...' : dashboard.lowStock.length}
                    </span>
                  </div>

                  {dashboardLoading ? (
                    <p className="empty-state">Checking stock levels...</p>
                  ) : dashboard.lowStock.length === 0 ? (
                    <p className="empty-state">
                      No low-stock products. Your stock levels look good.
                    </p>
                  ) : (
                    <div className="stock-list">
                      {dashboard.lowStock.slice(0, 6).map((product) => (
                        <div className="stock-row" key={product.id}>
                          <div>
                            <strong>{product.name}</strong>
                            <span>{product.category}</span>
                          </div>
                          <div className="stock-quantity">
                            <strong>
                              {number(product.stock_quantity)} {product.unit}
                            </strong>
                            <span>
                              Minimum: {number(product.low_stock_level)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="dashboard-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="setup-label">DAILY COSTS</span>
                      <h2>Today's expenses</h2>
                    </div>
                  </div>

                  <div className="expense-total">
                    {dashboardLoading ? '...' : money(dashboard.todayExpenses)}
                  </div>

                  <p className="muted">Expenses recorded for today.</p>

                  <div className="expense-note">
                    This figure updates when you record a new expense.
                  </div>
                </article>
              </section>

              <section className="dashboard-panel recent-panel">
                <div className="panel-heading">
                  <div>
                    <span className="setup-label">SALES ACTIVITY</span>
                    <h2>Recent transactions</h2>
                  </div>
                  <span className="recent-caption">LATEST 6 SALES</span>
                </div>

                {dashboardLoading ? (
                  <p className="empty-state">Loading transactions...</p>
                ) : dashboard.recentSales.length === 0 ? (
                  <p className="empty-state">
                    No sales recorded yet. Your transactions will appear here.
                  </p>
                ) : (
                  <div className="table-scroll">
                    <table className="sales-table">
                      <thead>
                        <tr>
                          <th>RECEIPT</th>
                          <th>DATE & TIME</th>
                          <th>PAYMENT</th>
                          <th>STATUS</th>
                          <th className="amount-cell">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.recentSales.map((sale) => (
                          <tr key={sale.id}>
                            <td>
                              {sale.receipt_number || sale.id.slice(0, 8)}
                            </td>
                            <td>
                              {new Date(sale.created_at).toLocaleString('en-KE')}
                            </td>
                            <td>{sale.payment_method}</td>
                            <td>
                              <span
                                className={
                                  sale.payment_status?.toLowerCase() === 'paid'
                                    ? 'payment-status paid'
                                    : 'payment-status pending'
                                }
                              >
                                {sale.payment_status}
                              </span>
                            </td>
                            <td className="amount-cell">{money(sale.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* PRODUCTS */}
          {activePage === 'products' && (
            <>
              <header className="dashboard-header products-page-header">
                <div>
                  <span className="setup-label">INVENTORY MANAGEMENT</span>
                  <h1>Products & Stock</h1>
                  <p>Add products, manage prices and monitor stock levels.</p>
                </div>

                <button
                  className="refresh-button"
                  onClick={loadProducts}
                  disabled={productsLoading}
                >
                  {productsLoading ? 'LOADING...' : 'REFRESH PRODUCTS'}
                </button>
              </header>

              <section className="product-summary-grid">
                <article className="product-summary-card">
                  <span>TOTAL PRODUCTS</span>
                  <strong>{number(products.length)}</strong>
                </article>

                <article className="product-summary-card">
                  <span>LOW STOCK ITEMS</span>
                  <strong className="red-number">
                    {number(
                      products.filter(
                        (product) =>
                          Number(product.stock_quantity) <=
                          Number(product.low_stock_level)
                      ).length
                    )}
                  </strong>
                </article>

                <article className="product-summary-card">
                  <span>TOTAL QUANTITY</span>
                  <strong>
                    {number(
                      products.reduce(
                        (sum, product) =>
                          sum + Number(product.stock_quantity || 0),
                        0
                      )
                    )}
                  </strong>
                </article>
              </section>

              <section className="dashboard-panel products-panel">
                <div className="products-toolbar">
                  <div>
                    <span className="setup-label">YOUR CATALOGUE</span>
                    <h2>All products</h2>
                  </div>

                  <button
                    className="add-product-button"
                    onClick={openNewProductForm}
                  >
                    + ADD NEW PRODUCT
                  </button>
                </div>

                {productMessage && (
                  <div className="alert success-alert">{productMessage}</div>
                )}

                {productsError && (
                  <div className="alert error-alert">{productsError}</div>
                )}

                <div className="product-search">
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search by product name or category..."
                  />
                </div>

                {productsLoading ? (
                  <p className="empty-state">Loading your products...</p>
                ) : filteredProducts.length === 0 ? (
                  <div className="products-empty">
                    <h3>
                      {products.length === 0
                        ? 'No products added yet.'
                        : 'No matching products.'}
                    </h3>
                    <p>
                      {products.length === 0
                        ? 'Start by adding your first meat product.'
                        : 'Try another product name or category.'}
                    </p>
                    {products.length === 0 && (
                      <button
                        className="add-product-button"
                        onClick={openNewProductForm}
                      >
                        ADD YOUR FIRST PRODUCT
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>PRODUCT</th>
                          <th>CATEGORY</th>
                          <th>BUYING PRICE</th>
                          <th>SELLING PRICE</th>
                          <th>AVAILABLE STOCK</th>
                          <th>STOCK STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const isLow =
                            Number(product.stock_quantity || 0) <=
                            Number(product.low_stock_level || 0)

                          return (
                            <tr key={product.id}>
                              <td className="product-name-cell">
                                {product.name}
                              </td>
                              <td>{product.category}</td>
                              <td>{money(product.buying_price)}</td>
                              <td>{money(product.selling_price)}</td>
                              <td className="stock-cell">
                                {number(product.stock_quantity)} {product.unit}
                              </td>
                              <td>
                                <span
                                  className={
                                    isLow
                                      ? 'stock-status low'
                                      : 'stock-status available'
                                  }
                                >
                                  {isLow ? 'LOW STOCK' : 'AVAILABLE'}
                                </span>
                              </td>
                              <td>
                                <div className="product-actions">
                                  <button
                                    className="edit-product-button"
                                    onClick={() => openEditProductForm(product)}
                                  >
                                    EDIT
                                  </button>
                                  <button
                                    className="delete-product-button"
                                    onClick={() => handleDeleteProduct(product)}
                                    disabled={saving}
                                  >
                                    DELETE
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <footer className="dashboard-footer">
                <span>TECH SOLVE BUTCHERY PRO</span>
                <span>PRODUCTS & STOCK MANAGEMENT</span>
              </footer>
            </>
          )}

          {/* SALES AND RECEIPTS */}
          {activePage === 'sales' && (
            <>
              <header className="dashboard-header">
                <div>
                  <span className="setup-label">POINT OF SALE</span>
                  <h1>Sales & Receipts</h1>
                  <p>Record sales, collect payments and issue receipts.</p>
                </div>

                <button
                  className="refresh-button"
                  onClick={() => {
                    loadProducts()
                    loadSalesHistory()
                    loadCustomers()
                  }}
                  disabled={
                    productsLoading ||
                    salesHistoryLoading ||
                    customersLoading
                  }
                >
                  REFRESH SALES
                </button>
              </header>

              {saleError && (
                <div className="alert error-alert">{saleError}</div>
              )}

              {saleMessage && (
                <div className="alert success-alert">{saleMessage}</div>
              )}

              {customerError && (
                <div className="alert error-alert">{customerError}</div>
              )}

              <div className="pos-layout">
                <section className="dashboard-panel pos-products-panel">
                  <div className="products-toolbar">
                    <div>
                      <span className="setup-label">PRODUCT CATALOGUE</span>
                      <h2>Select products</h2>
                    </div>
                    <span className="panel-count">
                      {availableProducts.length}
                    </span>
                  </div>

                  <div className="product-search">
                    <input
                      type="search"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Find a product..."
                    />
                  </div>

                  {productsLoading ? (
                    <p className="empty-state">Loading products...</p>
                  ) : availableProducts.filter((product) => {
                      const search = productSearch.trim().toLowerCase()
                      return (
                        !search ||
                        product.name.toLowerCase().includes(search) ||
                        product.category.toLowerCase().includes(search)
                      )
                    }).length === 0 ? (
                    <p className="empty-state">
                      No available products. Add stock in Products & Stock first.
                    </p>
                  ) : (
                    <div className="pos-product-grid">
                      {availableProducts
                        .filter((product) => {
                          const search = productSearch.trim().toLowerCase()
                          return (
                            !search ||
                            product.name.toLowerCase().includes(search) ||
                            product.category.toLowerCase().includes(search)
                          )
                        })
                        .map((product) => (
                          <article className="pos-product-card" key={product.id}>
                            <div>
                              <span className="pos-product-category">
                                {product.category}
                              </span>
                              <h3>{product.name}</h3>
                              <p>
                                {number(product.stock_quantity)} {product.unit}{' '}
                                available
                              </p>
                            </div>

                            <div className="pos-product-bottom">
                              <strong>{money(product.selling_price)}</strong>
                              <button
                                type="button"
                                onClick={() => addToCart(product)}
                              >
                                ADD
                              </button>
                            </div>
                          </article>
                        ))}
                    </div>
                  )}
                </section>

                <section className="dashboard-panel pos-cart-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="setup-label">CURRENT TRANSACTION</span>
                      <h2>Sale cart</h2>
                    </div>
                    <span className="panel-count">{cart.length}</span>
                  </div>

                  {cart.length === 0 ? (
                    <div className="pos-cart-empty">
                      <h3>Your cart is empty.</h3>
                      <p>Select products to begin a sale.</p>
                    </div>
                  ) : (
                    <div className="cart-items">
                      {cart.map((item) => (
                        <div className="cart-item" key={item.product_id}>
                          <div className="cart-item-info">
                            <strong>{item.name}</strong>
                            <span>
                              {money(item.unit_price)} per {item.unit}
                            </span>
                          </div>

                          <div className="cart-item-controls">
                            <input
                              type="number"
                              min="0.01"
                              max={item.available_stock}
                              step="0.01"
                              value={item.quantity}
                              onChange={(event) =>
                                updateCartQuantity(
                                  item.product_id,
                                  event.target.value
                                )
                              }
                              aria-label={`Quantity for ${item.name}`}
                            />
                            <strong>
                              {money(item.quantity * item.unit_price)}
                            </strong>
                            <button
                              type="button"
                              className="remove-cart-button"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form className="checkout-form" onSubmit={completeSale}>
                    <label className="field">
                      <span>Customer (optional)</span>
                      <select
                        value={posCustomerId}
                        onChange={(event) =>
                          setPosCustomerId(event.target.value)
                        }
                        disabled={customersLoading || saleSaving}
                      >
                        <option value="">Walk-in customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                            {customer.phone ? ` — ${customer.phone}` : ''}
                          </option>
                        ))}
                      </select>
                    </label>

                    {customers.length === 0 && !customersLoading && (
                      <p className="muted">
                        No customers registered yet. You can register customers
                        from the Customers page. Walk-in sales are still available.
                      </p>
                    )}

                    {posCustomer && (
                      <div className="expense-note">
                        Selected customer: <strong>{posCustomer.name}</strong>
                        {posCustomer.phone
                          ? ` · ${posCustomer.phone}`
                          : ''}
                      </div>
                    )}

                    <label className="field">
                      <span>Discount (KES)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={cartDiscount}
                        onChange={(event) => setCartDiscount(event.target.value)}
                        placeholder="0.00"
                      />
                    </label>

                    <label className="field">
                      <span>Payment method</span>
                      <select
                        value={paymentMethod}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                      >
                        <option value="Cash">Cash</option>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Card">Card</option>
                      </select>
                    </label>

                    <label className="field">
                      <span>Payment status</span>
                      <select
                        value={paymentStatus}
                        onChange={(event) =>
                          setPaymentStatus(event.target.value)
                        }
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </label>

                    <div className="checkout-totals">
                      <div>
                        <span>Subtotal</span>
                        <strong>{money(cartSubtotal)}</strong>
                      </div>
                      <div>
                        <span>Discount</span>
                        <strong>{money(safeDiscount)}</strong>
                      </div>
                      <div className="checkout-grand-total">
                        <span>TOTAL TO PAY</span>
                        <strong>{money(cartTotal)}</strong>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="primary-button checkout-button"
                      disabled={saleSaving || cart.length === 0}
                    >
                      {saleSaving ? 'PROCESSING SALE...' : 'COMPLETE SALE'}
                    </button>

                    <button
                      type="button"
                      className="cancel-product-button clear-cart-button"
                      onClick={clearCart}
                      disabled={saleSaving || cart.length === 0}
                    >
                      CLEAR CART
                    </button>
                  </form>
                </section>
              </div>

              <section className="dashboard-panel recent-panel sales-history-panel">
                <div className="products-toolbar">
                  <div>
                    <span className="setup-label">TRANSACTION RECORDS</span>
                    <h2>Sales history</h2>
                  </div>
                </div>

                <div className="product-search">
                  <input
                    type="search"
                    value={salesSearch}
                    onChange={(event) => setSalesSearch(event.target.value)}
                    placeholder="Search receipt, payment method or status..."
                  />
                </div>

                {salesHistoryLoading ? (
                  <p className="empty-state">Loading sales history...</p>
                ) : filteredSales.length === 0 ? (
                  <p className="empty-state">No matching sales records.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="sales-table">
                      <thead>
                        <tr>
                          <th>RECEIPT</th>
                          <th>DATE</th>
                          <th>PAYMENT</th>
                          <th>STATUS</th>
                          <th>TOTAL</th>
                          <th>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSales.map((sale) => (
                          <tr key={sale.id}>
                            <td>{sale.receipt_number || sale.id.slice(0, 8)}</td>
                            <td>
                              {new Date(sale.created_at).toLocaleString('en-KE')}
                            </td>
                            <td>{sale.payment_method}</td>
                            <td>
                              <span
                                className={
                                  sale.payment_status === 'Paid'
                                    ? 'payment-status paid'
                                    : 'payment-status pending'
                                }
                              >
                                {sale.payment_status}
                              </span>
                            </td>
                            <td>{money(sale.total)}</td>
                            <td>
                              <button
                                className="edit-product-button"
                                type="button"
                                onClick={() => openPastReceipt(sale)}
                              >
                                VIEW RECEIPT
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {/* CUSTOMERS MANAGEMENT */}
          {activePage === 'customers' && (
            <>
              <header className="dashboard-header">
                <div>
                  <span className="setup-label">CUSTOMER MANAGEMENT</span>
                  <h1>Customers</h1>
                  <p>
                    Register customers, manage their details and view their
                    purchase history.
                  </p>
                </div>

                <button
                  className="refresh-button"
                  onClick={loadCustomers}
                  disabled={customersLoading}
                >
                  {customersLoading ? 'LOADING...' : 'REFRESH CUSTOMERS'}
                </button>
              </header>

              {customerError && (
                <div className="alert error-alert">{customerError}</div>
              )}

              {customerMessage && (
                <div className="alert success-alert">{customerMessage}</div>
              )}

              <section className="product-summary-grid">
                <article className="product-summary-card">
                  <span>REGISTERED CUSTOMERS</span>
                  <strong>{number(customers.length)}</strong>
                </article>

                <article className="product-summary-card">
                  <span>CUSTOMERS WITH PHONE NUMBERS</span>
                  <strong>
                    {number(
                      customers.filter((customer) => customer.phone).length
                    )}
                  </strong>
                </article>

                <article className="product-summary-card">
                  <span>SELECTED CUSTOMER SALES</span>
                  <strong>{number(customerSales.length)}</strong>
                </article>
              </section>

              {showCustomerForm && (
                <section className="dashboard-panel products-panel">
                  <div className="products-toolbar">
                    <div>
                      <span className="setup-label">
                        {editingCustomer ? 'UPDATE CUSTOMER' : 'NEW CUSTOMER'}
                      </span>
                      <h2>
                        {editingCustomer
                          ? 'Edit customer details'
                          : 'Register a customer'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="cancel-product-button"
                      onClick={closeCustomerForm}
                    >
                      CLOSE
                    </button>
                  </div>

                  <form
                    className="product-form"
                    onSubmit={handleCustomerSubmit}
                  >
                    <div className="form-grid">
                      <label className="field">
                        <span>Customer name *</span>
                        <input
                          type="text"
                          value={customerForm.name}
                          onChange={(event) =>
                            setCustomerForm((previous) => ({
                              ...previous,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Enter customer name"
                          required
                        />
                      </label>

                      <label className="field">
                        <span>Phone number</span>
                        <input
                          type="tel"
                          value={customerForm.phone}
                          onChange={(event) =>
                            setCustomerForm((previous) => ({
                              ...previous,
                              phone: event.target.value,
                            }))
                          }
                          placeholder="e.g. 0712345678"
                        />
                      </label>
                    </div>

                    <div className="product-form-actions">
                      <button
                        type="button"
                        className="cancel-product-button"
                        onClick={closeCustomerForm}
                        disabled={customerSaving}
                      >
                        CANCEL
                      </button>

                      <button
                        type="submit"
                        className="add-product-button"
                        disabled={customerSaving}
                      >
                        {customerSaving
                          ? 'SAVING...'
                          : editingCustomer
                            ? 'SAVE CHANGES'
                            : 'REGISTER CUSTOMER'}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="dashboard-panel products-panel">
                <div className="products-toolbar">
                  <div>
                    <span className="setup-label">CUSTOMER DATABASE</span>
                    <h2>All customers</h2>
                  </div>

                  <button
                    className="add-product-button"
                    type="button"
                    onClick={openNewCustomerForm}
                  >
                    + ADD CUSTOMER
                  </button>
                </div>

                <div className="product-search">
                  <input
                    type="search"
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="Search customers by name or phone..."
                  />
                </div>

                {customersLoading ? (
                  <p className="empty-state">Loading customers...</p>
                ) : filteredCustomers.length === 0 ? (
                  <div className="products-empty">
                    <h3>
                      {customers.length === 0
                        ? 'No customers registered yet.'
                        : 'No matching customers.'}
                    </h3>
                    <p>
                      {customers.length === 0
                        ? 'Register your first customer to begin building your customer database.'
                        : 'Try searching with another name or phone number.'}
                    </p>
                    {customers.length === 0 && (
                      <button
                        className="add-product-button"
                        type="button"
                        onClick={openNewCustomerForm}
                      >
                        REGISTER FIRST CUSTOMER
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>CUSTOMER NAME</th>
                          <th>PHONE NUMBER</th>
                          <th>DATE REGISTERED</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredCustomers.map((customer) => (
                          <tr key={customer.id}>
                            <td className="product-name-cell">
                              {customer.name}
                            </td>

                            <td>{customer.phone || 'Not provided'}</td>

                            <td>
                              {new Date(
                                customer.created_at
                              ).toLocaleDateString('en-KE')}
                            </td>

                            <td>
                              <div className="product-actions">
                                <button
                                  type="button"
                                  className="edit-product-button"
                                  onClick={() =>
                                    openCustomerHistory(customer)
                                  }
                                >
                                  HISTORY
                                </button>

                                <button
                                  type="button"
                                  className="edit-product-button"
                                  onClick={() =>
                                    openEditCustomerForm(customer)
                                  }
                                >
                                  EDIT
                                </button>

                                <button
                                  type="button"
                                  className="delete-product-button"
                                  onClick={() =>
                                    handleDeleteCustomer(customer)
                                  }
                                  disabled={customerSaving}
                                >
                                  DELETE
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {selectedCustomer && (
                <section className="dashboard-panel recent-panel">
                  <div className="products-toolbar">
                    <div>
                      <span className="setup-label">
                        CUSTOMER PURCHASE RECORD
                      </span>
                      <h2>{selectedCustomer.name}</h2>
                      <p className="muted">
                        {selectedCustomer.phone || 'No phone number provided'}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="cancel-product-button"
                      onClick={() => {
                        setSelectedCustomer(null)
                        setCustomerSales([])
                      }}
                    >
                      CLOSE HISTORY
                    </button>
                  </div>

                  <div className="product-summary-grid">
                    <article className="product-summary-card">
                      <span>RECORDED SALES</span>
                      <strong>{number(customerSales.length)}</strong>
                    </article>

                    <article className="product-summary-card">
                      <span>RECORDED SALES TOTAL</span>
                      <strong>{money(customerRecordedTotal)}</strong>
                    </article>

                    <article className="product-summary-card">
                      <span>PAID SALES TOTAL</span>
                      <strong>{money(customerPaidTotal)}</strong>
                    </article>
                  </div>

                  {customerSalesLoading ? (
                    <p className="empty-state">
                      Loading customer sales history...
                    </p>
                  ) : customerSales.length === 0 ? (
                    <p className="empty-state">
                      No sales have been linked to this customer yet.
                    </p>
                  ) : (
                    <div className="table-scroll">
                      <table className="sales-table">
                        <thead>
                          <tr>
                            <th>RECEIPT</th>
                            <th>DATE</th>
                            <th>PAYMENT METHOD</th>
                            <th>STATUS</th>
                            <th>TOTAL</th>
                          </tr>
                        </thead>

                        <tbody>
                          {customerSales.map((sale) => (
                            <tr key={sale.id}>
                              <td>
                                {sale.receipt_number || sale.id.slice(0, 8)}
                              </td>

                              <td>
                                {new Date(
                                  sale.created_at
                                ).toLocaleString('en-KE')}
                              </td>

                              <td>{sale.payment_method}</td>

                              <td>
                                <span
                                  className={
                                    sale.payment_status?.toLowerCase() ===
                                    'paid'
                                      ? 'payment-status paid'
                                      : 'payment-status pending'
                                  }
                                >
                                  {sale.payment_status}
                                </span>
                              </td>

                              <td>{money(sale.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              <footer className="dashboard-footer">
                <span>TECH SOLVE BUTCHERY PRO</span>
                <span>CUSTOMER MANAGEMENT</span>
              </footer>
            </>
          )}

          {/* EXPENSES MANAGEMENT */}
          {activePage === 'expenses' && (
            <>
              <header className="dashboard-header">
                <div>
                  <span className="setup-label">BUSINESS FINANCES</span>
                  <h1>Expenses</h1>
                  <p>Record and manage your butchery business expenses.</p>
                </div>

                <button
                  className="refresh-button"
                  onClick={loadExpenses}
                  disabled={expensesLoading}
                >
                  {expensesLoading ? 'LOADING...' : 'REFRESH EXPENSES'}
                </button>
              </header>

              {expenseError && (
                <div className="alert error-alert">{expenseError}</div>
              )}

              {expenseMessage && (
                <div className="alert success-alert">{expenseMessage}</div>
              )}

              <section className="product-summary-grid">
                <article className="product-summary-card">
                  <span>TOTAL RECORDED EXPENSES</span>
                  <strong>{money(totalExpenses)}</strong>
                </article>

                <article className="product-summary-card">
                  <span>TODAY'S EXPENSES</span>
                  <strong>{money(todayExpensesTotal)}</strong>
                </article>

                <article className="product-summary-card">
                  <span>NUMBER OF RECORDS</span>
                  <strong>{number(expenses.length)}</strong>
                </article>
              </section>

              {showExpenseForm && (
                <section className="dashboard-panel products-panel">
                  <div className="products-toolbar">
                    <div>
                      <span className="setup-label">
                        {editingExpense ? 'UPDATE EXPENSE' : 'NEW EXPENSE'}
                      </span>
                      <h2>
                        {editingExpense
                          ? 'Edit expense details'
                          : 'Record a business expense'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="cancel-product-button"
                      onClick={closeExpenseForm}
                    >
                      CLOSE
                    </button>
                  </div>

                  <form
                    className="product-form"
                    onSubmit={handleExpenseSubmit}
                  >
                    <div className="form-grid">
                      <label className="field">
                        <span>Amount (KES) *</span>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={expenseForm.amount}
                          onChange={(event) =>
                            setExpenseForm((previous) => ({
                              ...previous,
                              amount: event.target.value,
                            }))
                          }
                          placeholder="Enter amount"
                          required
                        />
                      </label>

                      <label className="field">
                        <span>Expense category *</span>
                        <select
                          value={expenseForm.category}
                          onChange={(event) =>
                            setExpenseForm((previous) => ({
                              ...previous,
                              category: event.target.value,
                            }))
                          }
                          required
                        >
                          <option value="Other">Other</option>
                          <option value="Stock Purchase">Stock Purchase</option>
                          <option value="Salaries">Salaries</option>
                          <option value="Rent">Rent</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Water">Water</option>
                          <option value="Transport">Transport</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Expense date *</span>
                        <input
                          type="date"
                          value={expenseForm.expense_date}
                          onChange={(event) =>
                            setExpenseForm((previous) => ({
                              ...previous,
                              expense_date: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>

                      <label className="field">
                        <span>Description</span>
                        <input
                          type="text"
                          value={expenseForm.description}
                          onChange={(event) =>
                            setExpenseForm((previous) => ({
                              ...previous,
                              description: event.target.value,
                            }))
                          }
                          placeholder="Optional expense details"
                        />
                      </label>
                    </div>

                    <div className="product-form-actions">
                      <button
                        type="button"
                        className="cancel-product-button"
                        onClick={closeExpenseForm}
                        disabled={expenseSaving}
                      >
                        CANCEL
                      </button>

                      <button
                        type="submit"
                        className="add-product-button"
                        disabled={expenseSaving}
                      >
                        {expenseSaving
                          ? 'SAVING...'
                          : editingExpense
                            ? 'SAVE CHANGES'
                            : 'RECORD EXPENSE'}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="dashboard-panel products-panel">
                <div className="products-toolbar">
                  <div>
                    <span className="setup-label">EXPENSE DATABASE</span>
                    <h2>All expenses</h2>
                  </div>

                  <button
                    className="add-product-button"
                    type="button"
                    onClick={openNewExpenseForm}
                  >
                    + ADD EXPENSE
                  </button>
                </div>

                <div className="product-search">
                  <input
                    type="search"
                    value={expenseSearch}
                    onChange={(event) => setExpenseSearch(event.target.value)}
                    placeholder="Search by category or description..."
                  />
                </div>

                {expensesLoading ? (
                  <p className="empty-state">Loading expenses...</p>
                ) : filteredExpenses.length === 0 ? (
                  <div className="products-empty">
                    <h3>
                      {expenses.length === 0
                        ? 'No expenses recorded yet.'
                        : 'No matching expenses.'}
                    </h3>
                    <p>
                      {expenses.length === 0
                        ? 'Record your first expense to start tracking business costs.'
                        : 'Try another category or description.'}
                    </p>

                    {expenses.length === 0 && (
                      <button
                        className="add-product-button"
                        type="button"
                        onClick={openNewExpenseForm}
                      >
                        RECORD FIRST EXPENSE
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>DATE</th>
                          <th>CATEGORY</th>
                          <th>DESCRIPTION</th>
                          <th>AMOUNT</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredExpenses.map((expense) => (
                          <tr key={expense.id}>
                            <td>
                              {expense.expense_date
                                ? new Date(
                                    `${expense.expense_date}T00:00:00`
                                  ).toLocaleDateString('en-KE')
                                : '—'}
                            </td>

                            <td>{expense.category || 'Other'}</td>

                            <td>{expense.description || '—'}</td>

                            <td className="product-name-cell">
                              {money(expense.amount)}
                            </td>

                            <td>
                              <div className="product-actions">
                                <button
                                  type="button"
                                  className="edit-product-button"
                                  onClick={() => openEditExpenseForm(expense)}
                                >
                                  EDIT
                                </button>

                                <button
                                  type="button"
                                  className="delete-product-button"
                                  onClick={() => handleDeleteExpense(expense)}
                                  disabled={expenseSaving}
                                >
                                  DELETE
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <footer className="dashboard-footer">
                <span>TECH SOLVE BUTCHERY PRO</span>
                <span>EXPENSE MANAGEMENT</span>
              </footer>
            </>
          )}

          {/* SUPPLIERS MANAGEMENT */}
          {activePage === 'suppliers' && (
            <>
              <header className="dashboard-header">
                <div>
                  <span className="setup-label">SUPPLIER MANAGEMENT</span>
                  <h1>Suppliers</h1>
                  <p>
                    Keep your supplier contacts and business details organised.
                  </p>
                </div>

                <button
                  className="refresh-button"
                  onClick={loadSuppliers}
                  disabled={suppliersLoading}
                >
                  {suppliersLoading ? 'LOADING...' : 'REFRESH SUPPLIERS'}
                </button>
              </header>

              {supplierError && (
                <div className="alert error-alert">{supplierError}</div>
              )}

              {supplierMessage && (
                <div className="alert success-alert">{supplierMessage}</div>
              )}

              <section className="product-summary-grid">
                <article className="product-summary-card">
                  <span>REGISTERED SUPPLIERS</span>
                  <strong>{number(suppliers.length)}</strong>
                </article>

                <article className="product-summary-card">
                  <span>SUPPLIERS WITH PHONE NUMBERS</span>
                  <strong>
                    {number(
                      suppliers.filter((supplier) => supplier.phone).length
                    )}
                  </strong>
                </article>

                <article className="product-summary-card">
                  <span>SUPPLIERS WITH ADDRESSES</span>
                  <strong>
                    {number(
                      suppliers.filter((supplier) => supplier.address).length
                    )}
                  </strong>
                </article>
              </section>

              {showSupplierForm && (
                <section className="dashboard-panel products-panel">
                  <div className="products-toolbar">
                    <div>
                      <span className="setup-label">
                        {editingSupplier ? 'UPDATE SUPPLIER' : 'NEW SUPPLIER'}
                      </span>
                      <h2>
                        {editingSupplier
                          ? 'Edit supplier details'
                          : 'Register a supplier'}
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="cancel-product-button"
                      onClick={closeSupplierForm}
                    >
                      CLOSE
                    </button>
                  </div>

                  <form
                    className="product-form"
                    onSubmit={handleSupplierSubmit}
                  >
                    <div className="form-grid">
                      <label className="field">
                        <span>Supplier name *</span>
                        <input
                          type="text"
                          value={supplierForm.name}
                          onChange={(event) =>
                            setSupplierForm((previous) => ({
                              ...previous,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Enter supplier or company name"
                          required
                        />
                      </label>

                      <label className="field">
                        <span>Phone number</span>
                        <input
                          type="tel"
                          value={supplierForm.phone}
                          onChange={(event) =>
                            setSupplierForm((previous) => ({
                              ...previous,
                              phone: event.target.value,
                            }))
                          }
                          placeholder="e.g. 0712345678"
                        />
                      </label>

                      <label className="field">
                        <span>Address</span>
                        <input
                          type="text"
                          value={supplierForm.address}
                          onChange={(event) =>
                            setSupplierForm((previous) => ({
                              ...previous,
                              address: event.target.value,
                            }))
                          }
                          placeholder="Supplier location or business address"
                        />
                      </label>
                    </div>

                    <div className="product-form-actions">
                      <button
                        type="button"
                        className="cancel-product-button"
                        onClick={closeSupplierForm}
                        disabled={supplierSaving}
                      >
                        CANCEL
                      </button>

                      <button
                        type="submit"
                        className="add-product-button"
                        disabled={supplierSaving}
                      >
                        {supplierSaving
                          ? 'SAVING...'
                          : editingSupplier
                            ? 'SAVE CHANGES'
                            : 'REGISTER SUPPLIER'}
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="dashboard-panel products-panel">
                <div className="products-toolbar">
                  <div>
                    <span className="setup-label">SUPPLIER DATABASE</span>
                    <h2>All suppliers</h2>
                  </div>

                  <button
                    className="add-product-button"
                    type="button"
                    onClick={openNewSupplierForm}
                  >
                    + ADD SUPPLIER
                  </button>
                </div>

                <div className="product-search">
                  <input
                    type="search"
                    value={supplierSearch}
                    onChange={(event) => setSupplierSearch(event.target.value)}
                    placeholder="Search suppliers by name, phone or address..."
                  />
                </div>

                {suppliersLoading ? (
                  <p className="empty-state">Loading suppliers...</p>
                ) : filteredSuppliers.length === 0 ? (
                  <div className="products-empty">
                    <h3>
                      {suppliers.length === 0
                        ? 'No suppliers registered yet.'
                        : 'No matching suppliers.'}
                    </h3>
                    <p>
                      {suppliers.length === 0
                        ? 'Register your first supplier to keep their contact details in one place.'
                        : 'Try another supplier name, phone number or address.'}
                    </p>

                    {suppliers.length === 0 && (
                      <button
                        className="add-product-button"
                        type="button"
                        onClick={openNewSupplierForm}
                      >
                        REGISTER FIRST SUPPLIER
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>SUPPLIER NAME</th>
                          <th>PHONE NUMBER</th>
                          <th>ADDRESS</th>
                          <th>DATE REGISTERED</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredSuppliers.map((supplier) => (
                          <tr key={supplier.id}>
                            <td className="product-name-cell">
                              {supplier.name}
                            </td>

                            <td>{supplier.phone || 'Not provided'}</td>

                            <td>{supplier.address || 'Not provided'}</td>

                            <td>
                              {supplier.created_at
                                ? new Date(
                                    supplier.created_at
                                  ).toLocaleDateString('en-KE')
                                : '—'}
                            </td>

                            <td>
                              <div className="product-actions">
                                <button
                                  type="button"
                                  className="edit-product-button"
                                  onClick={() =>
                                    openEditSupplierForm(supplier)
                                  }
                                >
                                  EDIT
                                </button>

                                <button
                                  type="button"
                                  className="delete-product-button"
                                  onClick={() =>
                                    handleDeleteSupplier(supplier)
                                  }
                                  disabled={supplierSaving}
                                >
                                  DELETE
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <footer className="dashboard-footer">
                <span>TECH SOLVE BUTCHERY PRO</span>
                <span>SUPPLIER MANAGEMENT</span>
              </footer>
            </>
          )}
          {/* REPORTS */}
{activePage === 'reports' && (
  <div className="dashboard-panel">
    <h1>Business Reports</h1>
    <p>Your business reports will appear here.</p>
  </div>
)}
{/* SUBSCRIPTION & PLANS */}
{activePage === 'subscription' && (
  <>
    <header className="dashboard-header">
      <div>
        <span className="setup-label">BUSINESS SUBSCRIPTION</span>
        <h1>Subscription & Plans</h1>
        <p>Choose the plan that supports your butchery business.</p>
      </div>
    </header>

    <section className="product-summary-grid">
      <article className="product-summary-card">
       <span>CURRENT PLAN</span>
<strong>{(planInfo?.plan || 'FREE').toUpperCase()}</strong>
<small>Your current subscription</small>
      </article>

      <article className="product-summary-card">
        <span>PRODUCT LIMIT</span>
<strong>
  {planInfo?.product_limit == null
    ? 'Unlimited'
    : number(planInfo.product_limit)}
</strong>
<small>Products allowed</small>
      </article>

      <article className="product-summary-card">
        <span>USER LIMIT</span>
<strong>{planInfo?.user_limit ?? 1}</strong>
<small>Users allowed</small>
      </article>
    </section>

<section className="dashboard-panel admin-payment-panel">
        <span className="setup-label">AVAILABLE PLANS</span>
      <h2>Choose your plan</h2>
      <p>
  Current monthly price: {money(planInfo?.price || 0)}
</p>

      <div className="product-summary-grid">
  {availablePlans.map((plan) => (
    <article className="product-summary-card" key={plan.plan}>
      <h2>{plan.plan.toUpperCase()}</h2>

      <strong>
        {money(plan.price)}
        {Number(plan.price) > 0 ? '/month' : ''}
      </strong>

      <p>
        {plan.product_limit == null
          ? 'Unlimited products'
          : `${plan.product_limit} products`}
      </p>

      <p>
        {plan.user_limit} {Number(plan.user_limit) === 1 ? 'user' : 'users'}
      </p>

      {plan.description && <p>{plan.description}</p>}

      {plan.plan === (planInfo?.plan || 'free') && (
        <small>CURRENT PLAN</small>
      )}
    </article>
  ))}
</div>
<form className="dashboard-panel payment-upgrade-panel" onSubmit={submitPaymentRequest}>
    <span className="setup-label">UPGRADE YOUR SUBSCRIPTION</span>
  <h2>Pay using M-Pesa</h2>

  <label>Choose your plan</label>
  <select
    value={selectedPlan}
    onChange={(e) => setSelectedPlan(e.target.value)}
  >
    <option value="standard">STANDARD — KSh 1,499/month</option>
    <option value="premium">PREMIUM — KSh 2,499/month</option>
  </select>

  <label>M-Pesa phone number</label>
  <input
    type="tel"
    value={paymentPhone}
    onChange={(e) => setPaymentPhone(e.target.value)}
    placeholder="e.g. 0712345678"
    required
  />

  <label>M-Pesa transaction code</label>
  <input
    type="text"
    value={mpesaCode}
    onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
    placeholder="e.g. QWE123ABC"
    required
  />

  <button type="submit" disabled={paymentSubmitting}>
    {paymentSubmitting ? 'Submitting...' : 'Submit payment for verification'}
  </button>

  {paymentMessage && <p>{paymentMessage}</p>}
</form>
      <p>
        To upgrade, contact TECH SOLVE +254 115 747135 for payment and subscription activation.
      </p>
    </section>
  </>
)}

{/* SETTINGS */}
{activePage === 'settings' && (
  <>
    <header className="dashboard-header">
      <div>
        <span className="setup-label">BUSINESS CONFIGURATION</span>
        <h1>Settings</h1>
        <p>Manage your butchery business account.</p>
      </div>
    </header>

    <section className="dashboard-panel">
      <span className="setup-label">BUSINESS PROFILE</span>
      <h2>{business.business_name}</h2>
      <p>Account email: {session.user.email}</p>
      <p>Manage your business details and account preferences here.</p>
    </section>
  </>
)}
        </div>
      </section>
      

      {/* PRODUCT FORM */}
      {showProductForm && (
        <div className="product-modal-backdrop">
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <div className="product-modal-header">
              <div>
                <span className="setup-label">
                  {editingProduct ? 'UPDATE CATALOGUE' : 'NEW CATALOGUE ITEM'}
                </span>
                <h2 id="product-form-title">
                  {editingProduct ? 'Edit product' : 'Add a product'}
                </h2>
              </div>

              <button
                className="modal-close-button"
                type="button"
                onClick={closeProductForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form className="product-form" onSubmit={handleProductSubmit}>
              <label className="field">
                <span>Product name *</span>
                <input
                  name="name"
                  value={productForm.name}
                  onChange={updateProductField}
                  placeholder="e.g. Beef steak"
                  required
                />
              </label>

              <div className="form-grid">
                <label className="field">
                  <span>Category *</span>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={updateProductField}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Unit *</span>
                  <select
                    name="unit"
                    value={productForm.unit}
                    onChange={updateProductField}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="piece">Pieces</option>
                    <option value="pack">Packs</option>
                    <option value="tray">Trays</option>
                  </select>
                </label>

                <label className="field">
                  <span>Buying price (KES) *</span>
                  <input
                    type="number"
                    name="buying_price"
                    min="0"
                    step="0.01"
                    value={productForm.buying_price}
                    onChange={updateProductField}
                    required
                  />
                </label>

                <label className="field">
                  <span>Selling price (KES) *</span>
                  <input
                    type="number"
                    name="selling_price"
                    min="0"
                    step="0.01"
                    value={productForm.selling_price}
                    onChange={updateProductField}
                    required
                  />
                </label>

                <label className="field">
                  <span>Available stock *</span>
                  <input
                    type="number"
                    name="stock_quantity"
                    min="0"
                    step="0.01"
                    value={productForm.stock_quantity}
                    onChange={updateProductField}
                    required
                  />
                </label>

                <label className="field">
                  <span>Low-stock warning level *</span>
                  <input
                    type="number"
                    name="low_stock_level"
                    min="0"
                    step="0.01"
                    value={productForm.low_stock_level}
                    onChange={updateProductField}
                    required
                  />
                </label>
              </div>

              {productsError && (
                <div className="alert error-alert">{productsError}</div>
              )}

              <div className="product-form-actions">
                <button
                  type="button"
                  className="cancel-product-button"
                  onClick={closeProductForm}
                  disabled={saving}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="add-product-button"
                  disabled={saving}
                >
                  {saving
                    ? 'SAVING...'
                    : editingProduct
                      ? 'SAVE CHANGES'
                      : 'ADD PRODUCT'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* RECEIPT */}
      {completedReceipt && (
        <div className="receipt-modal-backdrop">
          <section className="receipt-modal">
            <div className="receipt-actions no-print">
              <button
                type="button"
                className="refresh-button"
                onClick={printReceipt}
              >
                PRINT RECEIPT
              </button>
              <button
                type="button"
                className="cancel-product-button"
                onClick={() => setCompletedReceipt(null)}
              >
                CLOSE
              </button>
            </div>

            <div className="receipt-paper" id="printable-receipt">
              <div className="receipt-brand">
                <strong>{completedReceipt.business_name}</strong>
                <span>SALES RECEIPT</span>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-details">
                <p>
                  <span>Receipt number</span>
                  <strong>{completedReceipt.receipt_number}</strong>
                </p>
                <p>
                  <span>Date</span>
                  <strong>
                    {new Date(
                      completedReceipt.created_at
                    ).toLocaleString('en-KE')}
                  </strong>
                </p>

                {completedReceipt.customer_name && (
                  <p>
                    <span>Customer</span>
                    <strong>{completedReceipt.customer_name}</strong>
                  </p>
                )}

                {completedReceipt.customer_phone && (
                  <p>
                    <span>Customer phone</span>
                    <strong>{completedReceipt.customer_phone}</strong>
                  </p>
                )}

                {completedReceipt.business_phone && (
                  <p>
                    <span>Phone</span>
                    <strong>{completedReceipt.business_phone}</strong>
                  </p>
                )}
                {completedReceipt.business_address && (
                  <p>
                    <span>Address</span>
                    <strong>{completedReceipt.business_address}</strong>
                  </p>
                )}
              </div>

              <div className="receipt-divider"></div>

              <table className="receipt-items-table">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th>QTY</th>
                    <th>PRICE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {completedReceipt.items.map((item, index) => (
                    <tr key={item.id || item.product_id || index}>
                      <td>{item.product_name || item.name}</td>
                      <td>{number(item.quantity)}</td>
                      <td>{money(item.unit_price)}</td>
                      <td>{money(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-divider"></div>

              <div className="receipt-totals">
                <p>
                  <span>Subtotal</span>
                  <strong>{money(completedReceipt.subtotal)}</strong>
                </p>
                <p>
                  <span>Discount</span>
                  <strong>{money(completedReceipt.discount)}</strong>
                </p>
                <p className="receipt-grand-total">
                  <span>TOTAL</span>
                  <strong>{money(completedReceipt.total)}</strong>
                </p>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-payment">
                <p>
                  <span>Payment method</span>
                  <strong>{completedReceipt.payment_method}</strong>
                </p>
                <p>
                  <span>Payment status</span>
                  <strong>{completedReceipt.payment_status}</strong>
                </p>
              </div>

              <div className="receipt-thanks">
                <strong>THANK YOU FOR YOUR BUSINESS</strong>
                <span>Powered by TECH SOLVE BUTCHERY PRO</span>
              </div>
            </div>
          </section>
        </div>
     )}
    </main>
  )
}

export default App