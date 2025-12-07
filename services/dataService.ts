
import { Drug, SaleRecord, User, SaleItem } from '../types';

const INITIAL_DRUGS: Drug[] = [
  // 1-5: 抗生素与消炎
  { id: '1', code: 'D001', name: '阿莫西林胶囊', category: '抗生素', manufacturer: '华北制药', price: 12.50, stock: 150, minStockThreshold: 50, expiryDate: '2025-12-31', description: '广谱半合成青霉素。', isLocked: true, createdAt: '2023-01-15T08:00:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '2', code: 'D002', name: '头孢拉定胶囊', category: '抗生素', manufacturer: '白云山制药', price: 22.00, stock: 80, minStockThreshold: 30, expiryDate: '2025-06-30', description: '适用于敏感菌所致的急性咽炎、扁桃体炎。', isLocked: false, createdAt: '2023-01-16T09:00:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '3', code: 'D003', name: '罗红霉素分散片', category: '抗生素', manufacturer: '扬子江药业', price: 18.50, stock: 60, minStockThreshold: 20, expiryDate: '2024-11-20', description: '大环内酯类抗生素。', isLocked: false, createdAt: '2023-01-16T10:00:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '4', code: 'D004', name: '诺氟沙星胶囊', category: '抗生素', manufacturer: '修正药业', price: 10.00, stock: 120, minStockThreshold: 40, expiryDate: '2025-08-15', description: '适用于敏感菌所致的尿路感染、淋病。', isLocked: false, createdAt: '2023-01-17T11:00:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '5', code: 'D005', name: '人工牛黄甲硝唑', category: '牙科用药', manufacturer: '康恩贝', price: 8.50, stock: 200, minStockThreshold: 50, expiryDate: '2026-01-10', description: '用于急性智齿冠周炎、局部牙槽脓肿。', isLocked: false, createdAt: '2023-01-18T14:00:00.000Z', createdBy: '系统管理员', history: [] },

  // 6-10: 感冒与呼吸系统
  { id: '6', code: 'D006', name: '感冒灵颗粒', category: '感冒药', manufacturer: '华润三九', price: 15.50, stock: 300, minStockThreshold: 50, expiryDate: '2025-05-20', description: '解热镇痛。用于感冒引起的头痛，发热。', isLocked: false, createdAt: '2023-02-01T08:30:00.000Z', createdBy: '李药师', history: [] },
  { id: '7', code: 'D007', name: '连花清瘟胶囊', category: '感冒药', manufacturer: '以岭药业', price: 24.00, stock: 45, minStockThreshold: 100, expiryDate: '2025-09-01', description: '清瘟解毒，宣肺泄热。', isLocked: false, createdAt: '2023-02-02T09:15:00.000Z', createdBy: '李药师', history: [] },
  { id: '8', code: 'D008', name: '复方氨酚烷胺片', category: '感冒药', manufacturer: '葵花药业', price: 11.00, stock: 150, minStockThreshold: 30, expiryDate: '2025-12-12', description: '用于缓解普通感冒及流行性感冒引起的发热、头痛。', isLocked: false, createdAt: '2023-02-03T10:20:00.000Z', createdBy: '李药师', history: [] },
  { id: '9', code: 'D009', name: '京都念慈菴蜜炼川贝枇杷膏', category: '止咳药', manufacturer: '京都念慈菴', price: 35.00, stock: 90, minStockThreshold: 20, expiryDate: '2026-03-15', description: '润肺化痰、止咳平喘。', isLocked: false, createdAt: '2023-02-04T11:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '10', code: 'D010', name: '盐酸氨溴索口服溶液', category: '止咳药', manufacturer: '勃林格殷格翰', price: 28.50, stock: 65, minStockThreshold: 15, expiryDate: '2025-07-20', description: '适用于痰液粘稠而不易咳出者。', isLocked: false, createdAt: '2023-02-05T13:45:00.000Z', createdBy: '李药师', history: [] },

  // 11-15: 止痛与骨科
  { id: '11', code: 'D011', name: '布洛芬缓释胶囊', category: '止痛药', manufacturer: '芬必得', price: 18.00, stock: 45, minStockThreshold: 100, expiryDate: '2024-11-30', description: '用于缓解轻至中度疼痛。', isLocked: false, createdAt: '2023-02-10T09:00:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '12', code: 'D012', name: '对乙酰氨基酚片', category: '止痛药', manufacturer: '必理通', price: 14.50, stock: 180, minStockThreshold: 40, expiryDate: '2025-10-10', description: '用于普通感冒或流行性感冒引起的发热。', isLocked: false, createdAt: '2023-02-11T10:30:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '13', code: 'D013', name: '云南白药气雾剂', category: '跌打损伤', manufacturer: '云南白药', price: 42.00, stock: 55, minStockThreshold: 15, expiryDate: '2026-02-28', description: '活血散瘀，消肿止痛。', isLocked: false, createdAt: '2023-02-12T14:20:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '14', code: 'D014', name: '双氯芬酸二乙胺乳胶剂', category: '跌打损伤', manufacturer: '扶他林', price: 32.00, stock: 70, minStockThreshold: 20, expiryDate: '2025-06-15', description: '用于缓解肌肉、软组织和关节的轻至中度疼痛。', isLocked: false, createdAt: '2023-02-13T15:00:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '15', code: 'D015', name: '麝香壮骨膏', category: '跌打损伤', manufacturer: '羚锐制药', price: 12.00, stock: 200, minStockThreshold: 50, expiryDate: '2025-12-01', description: '镇痛，消炎。用于风湿痛，关节痛。', isLocked: false, createdAt: '2023-02-14T16:00:00.000Z', createdBy: '系统管理员', history: [] },

  // 16-20: 慢性病与心血管
  { id: '16', code: 'D016', name: '硝苯地平控释片', category: '心血管', manufacturer: '拜耳医药', price: 38.00, stock: 100, minStockThreshold: 30, expiryDate: '2026-05-10', description: '治疗高血压、冠心病。', isLocked: false, createdAt: '2023-03-01T08:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '17', code: 'D017', name: '苯磺酸氨氯地平片', category: '心血管', manufacturer: '辉瑞制药', price: 45.00, stock: 95, minStockThreshold: 25, expiryDate: '2026-04-20', description: '高血压、慢性稳定性心绞痛。', isLocked: false, createdAt: '2023-03-02T09:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '18', code: 'D018', name: '阿司匹林肠溶片', category: '心血管', manufacturer: '拜耳医药', price: 16.00, stock: 150, minStockThreshold: 40, expiryDate: '2025-11-30', description: '抑制血小板聚集。', isLocked: false, createdAt: '2023-03-03T10:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '19', code: 'D019', name: '二甲双胍片', category: '糖尿病', manufacturer: '格华止', price: 25.00, stock: 130, minStockThreshold: 40, expiryDate: '2025-10-15', description: '首选的2型糖尿病治疗药物。', isLocked: false, createdAt: '2023-03-04T11:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '20', code: 'D020', name: '阿托伐他汀钙片', category: '心血管', manufacturer: '立普妥', price: 55.00, stock: 80, minStockThreshold: 20, expiryDate: '2026-01-01', description: '降低总胆固醇。', isLocked: false, createdAt: '2023-03-05T12:00:00.000Z', createdBy: '李药师', history: [] },

  // 21-25: 消化系统
  { id: '21', code: 'D021', name: '健胃消食片', category: '消化系统', manufacturer: '江中药业', price: 9.90, stock: 300, minStockThreshold: 60, expiryDate: '2025-08-08', description: '健胃消食。用于脾胃虚弱所致的食积。', isLocked: false, createdAt: '2023-03-10T08:30:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '22', code: 'D022', name: '奥美拉唑肠溶胶囊', category: '消化系统', manufacturer: '修正药业', price: 19.50, stock: 110, minStockThreshold: 30, expiryDate: '2025-09-20', description: '用于胃溃疡、十二指肠溃疡。', isLocked: false, createdAt: '2023-03-11T09:45:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '23', code: 'D023', name: '蒙脱石散', category: '消化系统', manufacturer: '思密达', price: 15.00, stock: 140, minStockThreshold: 40, expiryDate: '2026-02-15', description: '用于成人及儿童急、慢性腹泻。', isLocked: false, createdAt: '2023-03-12T10:50:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '24', code: 'D024', name: '开塞露', category: '消化系统', manufacturer: '广东一力', price: 2.50, stock: 400, minStockThreshold: 50, expiryDate: '2027-01-01', description: '用于便秘。', isLocked: false, createdAt: '2023-03-13T11:30:00.000Z', createdBy: '系统管理员', history: [] },
  { id: '25', code: 'D025', name: '多潘立酮片', category: '消化系统', manufacturer: '吗丁啉', price: 21.00, stock: 90, minStockThreshold: 20, expiryDate: '2025-12-25', description: '用于消化不良、腹胀。', isLocked: false, createdAt: '2023-03-14T13:00:00.000Z', createdBy: '系统管理员', history: [] },

  // 26-30: 皮肤与维生素
  { id: '26', code: 'D026', name: '氯雷他定片', category: '过敏/皮肤', manufacturer: '开瑞坦', price: 26.00, stock: 100, minStockThreshold: 30, expiryDate: '2026-04-10', description: '用于缓解过敏性鼻炎有关的症状。', isLocked: false, createdAt: '2023-04-01T08:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '27', code: 'D027', name: '999皮炎平', category: '过敏/皮肤', manufacturer: '华润三九', price: 16.50, stock: 120, minStockThreshold: 30, expiryDate: '2025-11-11', description: '用于局限性瘙痒症、神经性皮炎。', isLocked: false, createdAt: '2023-04-02T09:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '28', code: 'D028', name: '红霉素软膏', category: '过敏/皮肤', manufacturer: '白云山', price: 3.50, stock: 250, minStockThreshold: 60, expiryDate: '2026-06-06', description: '用于脓疱疮等化脓性皮肤病。', isLocked: false, createdAt: '2023-04-03T10:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '29', code: 'D029', name: '维生素C片', category: '维生素', manufacturer: '养生堂', price: 19.90, stock: 180, minStockThreshold: 50, expiryDate: '2025-10-30', description: '增强免疫力。', isLocked: false, createdAt: '2023-04-04T11:00:00.000Z', createdBy: '李药师', history: [] },
  { id: '30', code: 'D030', name: '葡萄糖酸钙锌口服溶液', category: '维生素', manufacturer: '三精制药', price: 45.00, stock: 60, minStockThreshold: 20, expiryDate: '2025-09-09', description: '用于治疗缺钙、缺锌。', isLocked: false, createdAt: '2023-04-05T12:00:00.000Z', createdBy: '李药师', history: [] }
];

const INITIAL_USERS: User[] = [
  { id: 'admin', username: 'admin', password: 'password', role: 'admin', name: '系统管理员' },
  { id: 'user1', username: 'pharm', password: 'password', role: 'pharmacist', name: '李药师' }
];

// Changed keys to force data re-initialization on client side
const KEYS = {
  DRUGS: 'meditrack_drugs_v2',
  SALES: 'meditrack_sales_v2',
  USERS: 'meditrack_users_v2',
  DELETED_DRUGS: 'meditrack_deleted_drugs_v2'
};

// Helper to generate realistic mock sales
const generateMockSales = (): SaleRecord[] => {
  const sales: SaleRecord[] = [];
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const customers = ['张伟', '王芳', '李娜', '刘强', '陈静', '杨洋', '赵敏', '周杰', '吴刚', '孙丽', '散客', '散客', '散客'];

  for (let i = 0; i < 50; i++) {
    // Random date within last 7 days, weighted slightly towards recent
    const timeOffset = Math.floor(Math.random() * 7 * ONE_DAY);
    const saleDate = new Date(now - timeOffset);
    
    // Determine number of items in this sale (1 to 4 items)
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const saleItems: SaleItem[] = [];
    let saleTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      // Pick random drug
      const drug = INITIAL_DRUGS[Math.floor(Math.random() * INITIAL_DRUGS.length)];
      // Random quantity 1-3
      const qty = Math.floor(Math.random() * 3) + 1;
      
      // Avoid duplicate drugs in same sale
      if (saleItems.some(item => item.drugId === drug.id)) continue;

      const itemTotal = drug.price * qty;
      saleItems.push({
        drugId: drug.id,
        drugName: drug.name,
        quantity: qty,
        priceAtSale: drug.price,
        total: itemTotal
      });
      saleTotal += itemTotal;
    }

    if (saleItems.length === 0) continue;

    sales.push({
      id: `SALE-${saleDate.getTime()}-${i}`,
      timestamp: saleDate.toISOString(),
      items: saleItems,
      totalAmount: saleTotal,
      cashierName: Math.random() > 0.3 ? '李药师' : '系统管理员',
      customerName: customers[Math.floor(Math.random() * customers.length)]
    });
  }

  // Sort by date descending
  return sales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const dataService = {
  getDrugs: (): Drug[] => {
    const data = localStorage.getItem(KEYS.DRUGS);
    if (!data) {
      localStorage.setItem(KEYS.DRUGS, JSON.stringify(INITIAL_DRUGS));
      return INITIAL_DRUGS;
    }
    return JSON.parse(data);
  },

  saveDrugs: (drugs: Drug[]) => {
    localStorage.setItem(KEYS.DRUGS, JSON.stringify(drugs));
  },

  // Trash Bin Handling
  getDeletedDrugs: (): Drug[] => {
    const data = localStorage.getItem(KEYS.DELETED_DRUGS);
    return data ? JSON.parse(data) : [];
  },

  saveDeletedDrugs: (drugs: Drug[]) => {
    localStorage.setItem(KEYS.DELETED_DRUGS, JSON.stringify(drugs));
  },

  getSales: (): SaleRecord[] => {
    const data = localStorage.getItem(KEYS.SALES);
    if (!data) {
      // Auto-generate 50 mock sales if empty
      const mockSales = generateMockSales();
      localStorage.setItem(KEYS.SALES, JSON.stringify(mockSales));
      return mockSales;
    }
    return JSON.parse(data);
  },

  addSale: (sale: SaleRecord): SaleRecord[] => {
    const sales = dataService.getSales();
    const newSales = [sale, ...sales];
    localStorage.setItem(KEYS.SALES, JSON.stringify(newSales));
    return newSales;
  },

  // User Management
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  },

  registerUser: (user: User): { success: boolean, message: string } => {
    const users = dataService.getUsers();
    if (users.find(u => u.username === user.username)) {
      return { success: false, message: '用户名已存在' };
    }
    const newUsers = [...users, user];
    localStorage.setItem(KEYS.USERS, JSON.stringify(newUsers));
    return { success: true, message: '注册成功' };
  },

  loginUser: (username: string, password: string): User | undefined => {
    const users = dataService.getUsers();
    return users.find(u => u.username === username && u.password === password);
  },

  updateUser: (user: User) => {
    const users = dataService.getUsers();
    const newUsers = users.map(u => u.id === user.id ? user : u);
    localStorage.setItem(KEYS.USERS, JSON.stringify(newUsers));
  }
};