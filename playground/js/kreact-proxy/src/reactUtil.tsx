export function customJsx(type: any, props: Record<string, any>, ...children: any[]) {
  if (props) {
    if (children.length > 0) {
      return {type, props, children}
    } else {
      return {type, props}
    }
  } else {
    if (children.length > 0) {
      return {type, children}
    } else {
      return {type}
    }
  }
}