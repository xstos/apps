export function customJsx(type: any, props: Record<string, any>, ...children: any[]) {
  return {
    type,
    props: props ? props : {},
    children: children ? children : []
  }
}