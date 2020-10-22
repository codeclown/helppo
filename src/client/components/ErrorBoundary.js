import { createElement as h, Component } from "react";
import { mapStackTrace } from "sourcemapped-stacktrace";
import Container from "./Container";
import CodeBlock from "./CodeBlock";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      sourcemapped: null,
      errorInfo: null,
    };
    this.mapStackTracePromise = null;
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    if (this.mapStackTracePromise) {
      return;
    }
    this.mapStackTracePromise = new Promise((resolve) => {
      mapStackTrace(error.stack, (mappedStack) => {
        if (error === this.state.error) {
          this.setState({
            sourcemapped: `${this.state.error.message}\n${mappedStack.join(
              "\n"
            )}`,
          });
          this.mapStackTracePromise = null;
          resolve();
        }
      });
    });
    this.setState({ componentInfo: errorInfo });
  }

  render() {
    if (this.state.error) {
      const stack = `${this.state.sourcemapped || this.state.error.stack}${
        this.state.componentInfo ? this.state.componentInfo.componentStack : ""
      }`;
      return h(
        "div",
        { className: "ErrorBoundary" },
        h(Container, { verticalSlim: true }, "An unexpected error occurred:"),
        h(CodeBlock, null, stack)
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
