import {
  createElement as h,
  Component,
  ErrorInfo,
  ReactElement,
  Fragment,
} from "react";
import { mapStackTrace } from "sourcemapped-stacktrace";
import CodeBlock from "./CodeBlock";
import Container from "./Container";

class ErrorBoundary extends Component<
  unknown,
  { error: Error; sourcemapped: string | null; errorInfo: ErrorInfo }
> {
  mapStackTracePromise?: Promise<void>;

  constructor(props: unknown) {
    super(props);
    this.state = {
      error: null,
      sourcemapped: null,
      errorInfo: null,
    };
    this.mapStackTracePromise = null;
  }

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
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
    this.setState({ errorInfo });
  }

  render(): ReactElement {
    if (this.state.error) {
      const stack = `${this.state.sourcemapped || this.state.error.stack}${
        this.state.errorInfo ? this.state.errorInfo.componentStack : ""
      }`;
      return h(
        "div",
        { className: "ErrorBoundary" },
        h(Container, { verticalSlim: true }, "An unexpected error occurred:"),
        h(CodeBlock, null, stack)
      );
    }

    return h(Fragment, null, this.props.children);
  }
}

export default ErrorBoundary;
