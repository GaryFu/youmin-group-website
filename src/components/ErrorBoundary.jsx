import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg border border-red-200">
            <h1 className="text-xl font-bold text-red-700 mb-4">页面加载错误</h1>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
              <code className="text-sm text-red-800 whitespace-pre-wrap break-all">
                {this.state.error?.message || String(this.state.error)}
              </code>
            </div>
            {this.state.info?.componentStack && (
              <details className="mb-4">
                <summary className="text-sm text-gray-500 cursor-pointer">组件堆栈</summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-auto max-h-60">
                  {this.state.info.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
