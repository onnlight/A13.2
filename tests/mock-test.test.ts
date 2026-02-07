import { mockLocalStorage } from './setup';

describe('Basic Mock Test', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });
  
  test('localStorage mock should work', () => {
    mockLocalStorage.setItem('test', 'value');
    mockLocalStorage.getItem = jest.fn().mockReturnValue('value');
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test', 'value');
    expect(mockLocalStorage.getItem('test')).toBe('value');
  });
});