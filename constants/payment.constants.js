export const PAYMENT_STATUS = Object.freeze({
    PENDING:"pending", 
    SUCCESS:"success", 
    FAILED:"failed"
})

export const PAYMENT_STATUS_ARRAY = Object.freeze(Object.values(PAYMENT_STATUS));


export const PAYABLE_TYPE = Object.freeze({
    ORDER: "order", 
    BOOKING: "booking"
})