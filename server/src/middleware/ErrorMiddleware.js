const ErrorMiddleware = (err, req, res, next) => {
    console.error('Error:', err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ message: 'Internal server error' });
}

export default ErrorMiddleware;