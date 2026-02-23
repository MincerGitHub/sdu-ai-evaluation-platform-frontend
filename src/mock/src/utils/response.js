const successResponse = (data, message = "ok") => {
    return {
        code: 0,
        message: message,
        data: data,
    };
};

const errorResponse = (code, message, error = null) => {
    return {
        code: code,
        message: message,
        error: error,
    };
};

export { successResponse, errorResponse };