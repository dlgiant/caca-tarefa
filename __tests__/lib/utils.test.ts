import {
  cn,
  formatDate,
  formatCurrency,
  generateId,
  debounce,
  throttle,
} from '@/lib/utils';
describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('merges multiple class names', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toBe('base-class additional-class');
    });
    it('handles conditional classes', () => {
      const condition = true;
      const result = cn(
        'base',
        condition && 'active',
        !condition && 'inactive'
      );
      expect(result).toBe('base active');
    });
    it('merges Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4');
    });
    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });
  });
  describe('formatDate', () => {
    it('formats date in default format', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);
      expect(result).toBe('15 de janeiro de 2024');
    });
    it('formats date with custom format', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date, 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });
    it('handles string dates', () => {
      const result = formatDate('2024-01-15', 'dd/MM/yyyy');
      expect(result).toBe('15/01/2024');
    });
    it('returns empty string for invalid dates', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('');
    });
  });
  describe('formatCurrency', () => {
    it('formats number as BRL currency', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234,56');
      expect(result).toContain('R$');
    });
    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0,00');
      expect(result).toContain('R$');
    });
    it('formats negative numbers', () => {
      const result = formatCurrency(-500.99);
      expect(result).toContain('500,99');
      expect(result).toContain('-');
    });
    it('rounds to 2 decimal places', () => {
      const result = formatCurrency(10.999);
      expect(result).toContain('11,00');
      expect(result).toContain('R$');
    });
  });
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
    it('generates IDs with correct format', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]{8,}$/);
    });
    it('generates IDs with prefix when provided', () => {
      const id = generateId('user');
      expect(id).toMatch(/^user_[a-z0-9]{8,}$/);
    });
  });
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it('delays function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 500);
      debouncedFn('test');
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(499);
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledWith('test');
      expect(fn).toHaveBeenCalledTimes(1);
    });
    it('cancels previous calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 500);
      debouncedFn('first');
      jest.advanceTimersByTime(300);
      debouncedFn('second');
      jest.advanceTimersByTime(300);
      debouncedFn('third');
      jest.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });
  });
  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it('limits function execution rate', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 1000);
      throttledFn('first');
      expect(fn).toHaveBeenCalledWith('first');
      expect(fn).toHaveBeenCalledTimes(1);
      throttledFn('second');
      expect(fn).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(500);
      throttledFn('third');
      expect(fn).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(500);
      throttledFn('fourth');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith('fourth');
    });
    it('executes immediately on first call', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 1000);
      throttledFn('test');
      expect(fn).toHaveBeenCalledWith('test');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
