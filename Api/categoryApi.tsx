import { gql } from "@apollo/client";
import { apiSlice } from "../store/api/apiSlice";
import { configuration } from "@/utils/config";
import {  PRODUCT_LIST } from "@/query/categoryList";


export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllProducts: builder.query({
     query: ({ channel, first }) => configuration(PRODUCT_LIST({ channel, first })),
      // query: () => `/api/product/all`,
      providesTags: ["category"],
    }),
   
  }),
});

export const {
  useGetAllProductsQuery,
 
} = productApi;
