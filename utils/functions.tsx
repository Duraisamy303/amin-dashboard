import { useState } from "react";

export const capitalizeFLetter = (string = "") => {
  if (string.length > 0) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return string;
};

export const useSetState = (initialState:any) => {
  const [state, setState] = useState(initialState);

  const newSetState = (newState:any) => {
    setState((prevState:any) => ({...prevState, ...newState}));
  };
  return [state, newSetState];
};

export const getPrice = () => {
  let price;
};

export const shortData = (selectValue:any, products:any) => {
  if (!selectValue || !products?.length) {
    return null;
  }

  let product_items = [...products];

  if (selectValue === "Low to High") {
    product_items.sort((a, b) => {
      const priceA = Number(a?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
      const priceB = Number(b?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
      return priceA - priceB;
    });
  } else if (selectValue === "High to Low") {
    product_items.sort((a, b) => {
      const priceA = Number(a?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
      const priceB = Number(b?.node?.pricing?.priceRange?.start?.gross?.amount) || 0;
      return priceB - priceA;
    });
  } else if (selectValue === "New Added") {
    product_items.sort((a, b) => {
      const dateA = new Date(a?.node?.created) || new Date();
      const dateB = new Date(b?.node?.created) || new Date();
      return dateB - dateA;
    });
  } else if (selectValue === "On Sale") {
    product_items = products.filter((p) => p.node.pricing.discount > 0);
  }

  return product_items;
};

