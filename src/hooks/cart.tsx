import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // mvz - TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStoraged = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (productsStoraged) setProducts(JSON.parse(productsStoraged));
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // mvz - TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const listProducts = [...products];

      const index = listProducts.findIndex(product => product.id === id);

      if (index < 0) return;

      listProducts[index].quantity += 1;

      setProducts(listProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(listProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // mvz - TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const listProducts = [...products];

      const index = listProducts.findIndex(product => product.id === id);

      if (index < 0) return;

      listProducts[index].quantity -= 1;

      if (listProducts[index].quantity <= 0) {
        listProducts.splice(index, 1);
      }

      setProducts(listProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(listProducts),
      );
    },
    [products], // eslint-disable-line
  );

  const addToCart = useCallback(
    async product => {
      // mvz - TODO ADD A NEW ITEM TO THE CART
      const newListProducts = [...products];

      const existProduct = newListProducts.find(
        productList => productList.id === product.id,
      );

      if (existProduct) {
        increment(existProduct.id);
        return;
      }

      newListProducts.push({
        ...product,
        quantity: 1,
      });

      setProducts(newListProducts);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(newListProducts),
      );
    },
    [products], // eslint-disable-line
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
