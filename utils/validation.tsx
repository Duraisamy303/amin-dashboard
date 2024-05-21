import * as Yup from 'yup';

export const billingValidation = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().required('Email is required'),
    company: Yup.string().required('Company is required'),
    address_1: Yup.string().required('Street address is required'),
    address_2: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().required('Postal code is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    phone: Yup.string().required('Phone is required'),
    paymentMethod: Yup.string().required('PaymentMethod is required'),
    transactionId: Yup.string().required('TransactionId is required'),

    // Add validation for other billing address fields here
});
// shipping: Yup.object().shape({
//     firstName: Yup.string().required('First Name is required'),
//     lastName: Yup.string().required('Last Name is required'),
//     email: Yup.string().required('Email is required'),
//     company: Yup.string().required('Company is required'),
//     address_1: Yup.string().required('Street address is required'),
//     address_2: Yup.string().required('Street address is required'),
//     city: Yup.string().required('City is required'),
//     pincode: Yup.string().required('Postal code is required'),
//     state: Yup.string().required('State is required'),
//     country: Yup.string().required('Country is required'),
//     phone: Yup.string().required('Phone is required'),
//     paymentMethod: Yup.string().required('PaymentMethod is required'),
//     transactionId: Yup.string().required('TransactionId is required'),
// }),
