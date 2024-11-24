// 自动 mock @vercel/blob 模块
jest.mock('@vercel/blob');

// 如果需要，可以在这里添加更多的全局设置
global.File = class File {
  constructor(bits, name, options = {}) {
    this.bits = bits;
    this.name = name;
    this.type = options.type || '';
    this.size = bits.reduce((acc, bit) => acc + (bit.length || 0), 0);
  }
};
