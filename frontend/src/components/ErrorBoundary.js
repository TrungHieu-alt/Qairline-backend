import React from 'react';

class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.log('Error:', error, 'Info:', info);
    }

    render() {
        if (this.state.hasError) {
            return <div className="text-center p-4 text-red-500">Đã xảy ra lỗi. Vui lòng thử lại.</div>;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;