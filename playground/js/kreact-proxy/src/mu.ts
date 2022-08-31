const unclipped_rect: mu_Rect = [0, 0, 0x1000000, 0x1000000]

type TStack = { items: any[], idx: number }

function pop(a: TStack) {
  a.idx--
  a.items.pop()
}

function push(stk: TStack, val: any) {
  stk.items[stk.idx] = val
  stk.idx++
}

const MU_ICON_CLOSE = 1,
  MU_ICON_CHECK = 2,
  MU_ICON_COLLAPSED = 3,
  MU_ICON_EXPANDED = 4,
  MU_ICON_MAX = 5
const MU_OPT_ALIGNCENTER = (1 << 0),
  MU_OPT_ALIGNRIGHT = (1 << 1),
  MU_OPT_NOINTERACT = (1 << 2),
  MU_OPT_NOFRAME = (1 << 3),
  MU_OPT_NORESIZE = (1 << 4),
  MU_OPT_NOSCROLL = (1 << 5),
  MU_OPT_NOCLOSE = (1 << 6),
  MU_OPT_NOTITLE = (1 << 7),
  MU_OPT_HOLDFOCUS = (1 << 8),
  MU_OPT_AUTOSIZE = (1 << 9),
  MU_OPT_POPUP = (1 << 10),
  MU_OPT_CLOSED = (1 << 11),
  MU_OPT_EXPANDED = (1 << 12)
const MU_KEY_SHIFT = (1 << 0),
  MU_KEY_CTRL = (1 << 1),
  MU_KEY_ALT = (1 << 2),
  MU_KEY_BACKSPACE = (1 << 3),
  MU_KEY_RETURN = (1 << 4)
const MU_MOUSE_LEFT = (1 << 0),
  MU_MOUSE_RIGHT = (1 << 1),
  MU_MOUSE_MIDDLE = (1 << 2)
const MU_RES_ACTIVE = (1 << 0),
  MU_RES_SUBMIT = (1 << 1),
  MU_RES_CHANGE = (1 << 2)
const [
  MU_COLOR_TEXT,
  MU_COLOR_BORDER,
  MU_COLOR_WINDOWBG,
  MU_COLOR_TITLEBG,
  MU_COLOR_TITLETEXT,
  MU_COLOR_PANELBG,
  MU_COLOR_BUTTON,
  MU_COLOR_BUTTONHOVER,
  MU_COLOR_BUTTONFOCUS,
  MU_COLOR_BASE,
  MU_COLOR_BASEHOVER,
  MU_COLOR_BASEFOCUS,
  MU_COLOR_SCROLLBASE,
  MU_COLOR_SCROLLTHUMB
] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

const [MU_CLIP_PART, MU_CLIP_ALL] = [1, 2]

const default_style_colors: mu_Color[] = [
  [230, 230, 230, 255], //MU_COLOR_TEXT
  [25, 25, 25, 255], //MU_COLOR_BORDER
  [50, 50, 50, 255], //MU_COLOR_WINDOWBG
  [25, 25, 25, 255], //MU_COLOR_TITLEBG
  [240, 240, 240, 255], //MU_COLOR_TITLETEXT
  [0, 0, 0, 0], //MU_COLOR_PANELBG
  [75, 75, 75, 255], //MU_COLOR_BUTTON
  [95, 95, 95, 255], //MU_COLOR_BUTTONHOVER
  [115, 115, 115, 255], //MU_COLOR_BUTTONFOCUS
  [30, 30, 30, 255], //MU_COLOR_BASE
  [35, 35, 35, 255], //MU_COLOR_BASEHOVER
  [40, 40, 40, 255], //MU_COLOR_BASEFOCUS
  [43, 43, 43, 255], //MU_COLOR_SCROLLBASE
  [30, 30, 30, 255], //MU_COLOR_SCROLLTHUMB
]
const default_style = {
  font: "",
  size: [68, 10],
  padding: 5,
  spacing: 4,
  indent: 24,
  title_height: 24,
  scrollbar_size: 12,
  thumb_size: 8,
  colors: default_style_colors
}

type mu_Style = typeof default_style

type mu_Rect = [number, number, number, number]
type mu_Vec2 = [number, number]
type mu_Color = [number, number, number, number]
type mu_Font = {}
type mu_Id = number
type mu_Container = {
  head: mu_Command,
  tail: mu_Command,
  rect: mu_Rect,
  body: mu_Rect,
  content_size: mu_Vec2,
  scroll: mu_Vec2,
  zindex: Int,
  open: Int
}
type mu_Command = mu_BaseCommand | mu_JumpCommand | mu_ClipCommand | mu_RectCommand | mu_TextCommand | mu_IconCommand
type mu_BaseCommand = {
  type: number,
  index: number,
}
type mu_JumpCommand = {
  dst: any
} & mu_BaseCommand
type mu_ClipCommand = {
  rect: mu_Rect
} & mu_BaseCommand

type mu_RectCommand = {
  rect: mu_Rect,
  color: mu_Color
} & mu_BaseCommand

type mu_TextCommand = {
  font: mu_Font,
  pos: mu_Vec2,
  color: mu_Color,
  str: string
} & mu_BaseCommand

type mu_IconCommand = {
  rect: mu_Rect,
  id: number,
  color: mu_Color,
} & mu_BaseCommand
type mu_PoolItem = {
  id: mu_Id,
  last_update: Int
}
type mu_Context = {
  text_width: (font: mu_Font, str: string) => Int,
  text_height: (font: mu_Font) => Int,
  draw_frame: (ctx: mu_Context, rect: mu_Rect, colorid: Int) => void,
  _style: mu_Style
  style: mu_Style
  hover: mu_Id,
  focus: mu_Id,
  last_id: mu_Id,
  last_rect: mu_Rect,
  last_zindex: Int,
  updated_focus: Int,
  frame: Int,
  hover_root: mu_Container | null,
  next_hover_root: mu_Container | null,
  scroll_target: mu_Container | null,
  number_edit_buf: string,
  number_edit: mu_Id,
  /* stacks */
  command_list: mu_Stack<any>,
  root_list: mu_Stack<mu_Container>,
  container_stack: mu_Stack<mu_Container>,
  clip_stack: mu_Stack<mu_Rect>
  id_stack: mu_Stack<mu_Id>
  layout_stack: mu_Stack<mu_Layout>
  /* retained state pools */
  container_pool: mu_PoolItem[],
  containers: mu_Container[],
  treenode_pool: mu_PoolItem,
  /* input state */
  mouse_pos: mu_Vec2,
  last_mouse_pos: mu_Vec2,
  mouse_delta: mu_Vec2,
  scroll_delta: mu_Vec2,
  mouse_down: Int,
  mouse_pressed: Int,
  key_down: Int,
  key_pressed: Int,
  input_text: string
}
type mu_Stack<T> = {
  idx: Int,
  items: T[]
}
type Int = number
type mu_Layout = {
  body: mu_Rect,
  next: mu_Rect,
  position: mu_Vec2,
  size: mu_Vec2,
  max: mu_Vec2,
  widths: Int[],
  items: Int,
  item_index: Int,
  next_row: Int,
  next_type: Int,
  indent: Int
}

function newLayout(): mu_Layout {
  return {
    body: [0, 0, 0, 0],
    next: [0, 0, 0, 0],
    position: [0, 0],
    size: [0, 0],
    max: [0, 0],
    widths: [],
    items: 0,
    item_index: 0,
    next_row: 0,
    next_type: 0,
    indent: 0
  }
}

const mu_max = Math.max
const mu_min = Math.min
const [MU_COMMAND_JUMP,
  MU_COMMAND_CLIP,
  MU_COMMAND_RECT,
  MU_COMMAND_TEXT,
  MU_COMMAND_ICON] = [1, 2, 3, 4, 5]

function mu_clamp(x: number, a: number, b: number) {
  return mu_min(b, mu_max(a, x))
}

const [x, y, w, h] = [0, 1, 2, 3]
const [r, g, b, a] = [0, 1, 2, 3]

function expand_rect(rect: mu_Rect, n: number): mu_Rect {
  return [rect[x] - n, rect[y] - n, rect[w] + n * 2, rect[h] + n * 2]
}

function intersect_rects(r1: mu_Rect, r2: mu_Rect): mu_Rect {
  let [x1, y1, x2, y2] = [
    mu_max(r1[x], r2[x]),
    mu_max(r1[y], r2[y]),
    mu_min(r1[x] + r1[w], r2[x] + r2[w]),
    mu_min(r1[y] + r1[h], r2[y] + r2[h])
  ]
  if (x2 < x1) {
    x2 = x1;
  }
  if (y2 < y1) {
    y2 = y1;
  }
  return [x1, y1, x2 - x1, y2 - y1]
}

function rect_overlaps_vec2(r: mu_Rect, p: mu_Vec2) {
  return p[x] >= r[x] && p[x] < r[x] + r[w] && p[y] >= r[y] && p[y] < r[y] + r[h];
}

function draw_frame(ctx: mu_Context, rect: mu_Rect, colorid: Int) {
  mu_draw_rect(ctx, rect, ctx.style.colors[colorid])
  if (colorid === MU_COLOR_SCROLLBASE ||
    colorid === MU_COLOR_SCROLLTHUMB ||
    colorid === MU_COLOR_TITLEBG) {
    return
  }
  if (ctx.style.colors[MU_COLOR_BORDER][a]) {
    mu_draw_box(ctx, expand_rect(rect, 1), ctx.style.colors[MU_COLOR_BORDER])
  }
}

function mu_init(ctx: mu_Context) {
  ctx.draw_frame = draw_frame
  ctx._style = default_style
  ctx.style = default_style
}

function mu_begin(ctx: mu_Context) {
  ctx.command_list.idx = 0
  ctx.root_list.idx = 0
  ctx.scroll_target = null
  ctx.hover_root = ctx.next_hover_root
  ctx.next_hover_root = null
  ctx.mouse_delta[x] = ctx.mouse_pos[x] - ctx.last_mouse_pos[x]
  ctx.mouse_delta[y] = ctx.mouse_pos[y] - ctx.last_mouse_pos[y]
  ctx.frame++
}

function compare_zindex(a: mu_Container, b: mu_Container) {
  return a.zindex - b.zindex
}

function mu_end(ctx: mu_Context) {
  let n: Int

  if (ctx.container_stack.idx !== 0
    || ctx.clip_stack.idx !== 0
    || ctx.id_stack.idx !== 0
    || ctx.layout_stack.idx !== 0) debugger

  if (ctx.scroll_target) {
    ctx.scroll_target.scroll[x] += ctx.scroll_delta[x]
    ctx.scroll_target.scroll[y] += ctx.scroll_delta[y]
  }

  if (!ctx.updated_focus) {
    ctx.focus = 0
  }
  ctx.updated_focus = 0

  if (ctx.mouse_pressed && ctx.next_hover_root &&
    ctx.next_hover_root.zindex < ctx.last_zindex && ctx.next_hover_root.zindex >= 0) {
    mu_bring_to_front(ctx, ctx.next_hover_root)
  }

  ctx.key_pressed = 0
  ctx.input_text = ""
  ctx.mouse_pressed = 0
  ctx.scroll_delta = [0, 0]
  ctx.last_mouse_pos = ctx.mouse_pos

  n = ctx.root_list.idx
  ctx.root_list.items.sort(compare_zindex)

  for (let i = 0; i < n; i++) {
    let cnt = ctx.root_list.items[i]
    if (i === 0) {
      const cmd = ctx.command_list.items[0] as mu_JumpCommand
      cmd.dst = cnt.head
    } else {
      const prev = ctx.root_list.items[i - 1] as mu_Container
      (prev.tail as mu_JumpCommand).dst = cnt.head
    }
    if (i === n - 1) {
      (cnt.tail as mu_JumpCommand).dst = ctx.command_list.items[ctx.command_list.idx]
    }
  }
}


function mu_set_focus(ctx: mu_Context, id: mu_Id) {
  ctx.focus = id
  ctx.updated_focus = 1
}

function hash(str: string) {
  let hash = 17;
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i);
    hash = hash * 23 + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function mu_get_id(ctx: mu_Context, name: string): mu_Id {
  const idx = ctx.id_stack.idx
  const res = (idx > 0) ? ctx.id_stack.items[idx - 1] : hash(name)
  ctx.last_id = res
  return res
}

function mu_push_id(ctx: mu_Context, name: string) {
  push(ctx.id_stack, mu_get_id(ctx, name))
}

function mu_pop_id(ctx: mu_Context) {
  pop(ctx.id_stack)
}

function mu_push_clip_rect(ctx: mu_Context, rect: mu_Rect) {
  const last = mu_get_clip_rect(ctx)
  push(ctx.clip_stack, intersect_rects(rect, last))
}

function mu_pop_clip_rect(ctx: mu_Context) {
  pop(ctx.clip_stack)
}

function mu_get_clip_rect(ctx: mu_Context) {
  return ctx.clip_stack.items[ctx.clip_stack.idx - 1]
}

function mu_check_clip(ctx: mu_Context, r: mu_Rect) {
  const cr = mu_get_clip_rect(ctx)
  if (r[x] > cr[y] + cr[w] || r[x] + r[w] < cr[x] ||
    r[y] > cr[y] + cr[h] || r[y] + r[h] < cr[y]) {
    return MU_CLIP_ALL;
  }
  if (r[x] >= cr[x] && r[x] + r[w] <= cr[x] + cr[w] &&
    r[y] >= cr[y] && r[y] + r[h] <= cr[y] + cr[h]) {
    return 0;
  }
  return MU_CLIP_PART;
}

function push_layout(ctx: mu_Context, body: mu_Rect, scroll: mu_Vec2) {
  const layout = newLayout()
  layout.body = [body[x] - scroll[x], body[y] - scroll[y], body[w], body[h]]
  layout.max = [-0x1000000, -0x1000000]
  push(ctx.layout_stack, layout)
  mu_layout_row(ctx, 1, [], 0)
}

function get_layout(ctx: mu_Context) {
  return ctx.layout_stack.items[ctx.layout_stack.idx]
}

function pop_container(ctx: mu_Context) {
  const cnt = mu_get_current_container(ctx)
  const layout = get_layout(ctx)
  cnt.content_size[x] = layout.max[x] - layout.body[x]
  cnt.content_size[y] = layout.max[y] - layout.body[y]
  pop(ctx.container_stack)
  pop(ctx.layout_stack)
  pop(ctx.id_stack)
}

function mu_get_current_container(ctx: mu_Context) {
  return ctx.container_stack.items[ctx.container_stack.idx - 1]
}

function get_container(ctx: mu_Context, id: mu_Id, opt: Int) {
  var idx = mu_pool_get(ctx, ctx.container_pool, id)
  if (idx >= 0) {
    if (ctx.containers[idx].open || ~opt & MU_OPT_CLOSED) {
      mu_pool_update(ctx, ctx.container_pool, idx)
    }
    return ctx.containers[idx]
  }
  if (opt & MU_OPT_CLOSED) {
    return null;
  }
  idx = mu_pool_init(ctx, ctx.container_pool, ctx.container_pool.length, id)
  const cnt = ctx.containers[idx]
  cnt.open = 1
  mu_bring_to_front(ctx, cnt)
  return cnt
}

function mu_get_container(ctx: mu_Context, name: string) {
  const id = mu_get_id(ctx, name)
  return get_container(ctx, id, 0)
}

function mu_bring_to_front(ctx: mu_Context, cnt: mu_Container) {
  cnt.zindex = ++ctx.last_zindex
}

//pool
function mu_pool_init(ctx: mu_Context, items: mu_PoolItem[], len: Int, id: mu_Id) {
  let i, n = -1, f = ctx.frame;
  for (i = 0; i < len; i++) {
    if (items[i].last_update < f) {
      f = items[i].last_update;
      n = i;
    }
  }
  if (n > -1) {
    debugger
  }
  items[n].id = id;
  mu_pool_update(ctx, items, n);
  return n;
}

function mu_pool_get(ctx: mu_Context, items: mu_PoolItem[], id: mu_Id) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      return i;
    }
  }
  return -1;
}

function mu_pool_update(ctx: mu_Context, items: mu_PoolItem[], idx: Int) {
  items[idx].last_update = ctx.frame;
}


/*============================================================================
** input handlers
**============================================================================*/

function mu_input_mousemove(ctx: mu_Context, x: Int, y: Int) {
  ctx.mouse_pos = [x, y];
}


function mu_input_mousedown(ctx: mu_Context, x: Int, y: Int, btn: Int) {
  mu_input_mousemove(ctx, x, y);
  ctx.mouse_down |= btn;
  ctx.mouse_pressed |= btn;
}


function mu_input_mouseup(ctx: mu_Context, x: Int, y: Int, btn: Int) {
  mu_input_mousemove(ctx, x, y);
  ctx.mouse_down &= ~btn;
}


function mu_input_scroll(ctx: mu_Context, x: Int, y: Int) {
  ctx.scroll_delta[x] += x;
  ctx.scroll_delta[y] += y;
}


function mu_input_keydown(ctx: mu_Context, key: Int) {
  ctx.key_pressed |= key;
  ctx.key_down |= key;
}


function mu_input_keyup(ctx: mu_Context, key: Int) {
  ctx.key_down &= ~key;
}

function mu_input_text(ctx: mu_Context, text: string) {
  ctx.input_text += text
}

//commandlist

function mu_push_command(ctx: mu_Context, type: Int): mu_Command {
  let cmd = ctx.command_list.items[ctx.command_list.idx]
  cmd.type = type
  ctx.command_list.idx++
  return cmd
}

function mu_next_command(ctx: mu_Context) {
  //todo
}

function push_jump(ctx: mu_Context, dst: mu_Command) {
  let cmd = mu_push_command(ctx, MU_COMMAND_JUMP) as mu_JumpCommand
  cmd.dst = dst
}

function mu_set_clip(ctx: mu_Context, rect: mu_Rect) {
  let cmd = mu_push_command(ctx, MU_COMMAND_CLIP) as mu_ClipCommand
  cmd.rect = rect
}

function mu_draw_rect(ctx: mu_Context, rect: mu_Rect, color: mu_Color) {
  rect = intersect_rects(rect, mu_get_clip_rect(ctx))
  if (!(rect[w] > 0 && rect[h] > 0)) return
  const cmd = mu_push_command(ctx, MU_COMMAND_RECT) as mu_RectCommand
  cmd.rect = rect
  cmd.color = color
}

function mu_draw_box(ctx: mu_Context, rect: mu_Rect, color: mu_Color) {
  mu_draw_rect(ctx, [rect[x] + 1, rect[y], rect[w] - 2, 1], color);
  mu_draw_rect(ctx, [rect[x] + 1, rect[y] + rect[h] - 1, rect[w] - 2, 1], color);
  mu_draw_rect(ctx, [rect[x], rect[y], 1, rect[h]], color);
  mu_draw_rect(ctx, [rect[x] + rect[w] - 1, rect[y], 1, rect[h]], color);
}

function mu_draw_text(ctx: mu_Context, font: mu_Font, str: string, pos: mu_Vec2, color: mu_Color) {
  const rect: mu_Rect = [pos[x], pos[y], ctx.text_width(font, str), ctx.text_height(font)]
  const clipped = mu_check_clip(ctx, rect)
  if (clipped === MU_CLIP_ALL) return
  if (clipped === MU_CLIP_PART) mu_set_clip(ctx, mu_get_clip_rect(ctx))
  const len = str.length
  const cmd = mu_push_command(ctx, MU_COMMAND_TEXT) as mu_TextCommand
  cmd.str = str
  cmd.pos = pos
  cmd.color = color
  cmd.font = font
  if (clipped) {
    mu_set_clip(ctx, unclipped_rect)
  }
}

function mu_draw_icon(ctx: mu_Context, id: Int, rect: mu_Rect, color: mu_Color) {
  const clipped = mu_check_clip(ctx, rect)
  if (clipped === MU_CLIP_ALL) return
  if (clipped === MU_CLIP_PART) mu_set_clip(ctx, mu_get_clip_rect(ctx))
  const cmd = mu_push_command(ctx, MU_COMMAND_ICON) as mu_IconCommand
  cmd.id = id
  cmd.rect = rect
  cmd.color = color
  if (clipped) {
    mu_set_clip(ctx, unclipped_rect)
  }
}

const [RELATIVE, ABSOLUTE] = [1, 2]

function mu_layout_begin_column(ctx: mu_Context) {
  push_layout(ctx, mu_layout_next(ctx), [0, 0])
}

function mu_layout_end_column(ctx: mu_Context) {
  let a: mu_Layout, b: mu_Layout
  b = get_layout(ctx)
  pop(ctx.layout_stack)
  /* inherit position/next_row/max from child layout if they are greater */
  a = get_layout(ctx)
  a.position[x] = mu_max(a.position[x], b.position[x] + b.body[x] - a.body[x])
  a.next_row = mu_max(a.next_row, b.next_row + b.body[y] - a.body[y])
  a.max[x] = mu_max(a.max[x], b.max[x])
  a.max[y] = mu_max(a.max[y], b.max[y])
}

function mu_layout_row(ctx: mu_Context, items: Int, widths: Int[], height: Int) {
  const layout = get_layout(ctx)
  if (widths.length > 0) {
    layout.widths = widths
  }
  layout.items = items
  layout.position = [layout.indent, layout.next_row]
  layout.size[y] = height
  layout.item_index = 0
}

function mu_layout_width(ctx: mu_Context, width: Int) {
  get_layout(ctx).size[x] = width
}

function mu_layout_height(ctx: mu_Context, height: Int) {
  get_layout(ctx).size[y] = height
}

function mu_layout_set_next(ctx: mu_Context, r: mu_Rect, relative: Int) {
  const layout = get_layout(ctx)
  layout.next = r
  layout.next_type = relative ? RELATIVE : ABSOLUTE
}

function mu_layout_next(ctx: mu_Context) {
  const layout = get_layout(ctx)
  const style = ctx.style
  let res: mu_Rect = [0, 0, 0, 0]
  if (layout.next_type) {
    /* handle rect set by `mu_layout_set_next` */
    const type = layout.next_type
    layout.next_type = 0
    res = layout.next
    if (type === ABSOLUTE) {
      ctx.last_rect = res
      return res
    }
  } else {
    /* handle next row */
    if (layout.item_index === layout.items) {
      mu_layout_row(ctx, layout.items, [], layout.size[y])
    }

    res[x] = layout.position[x]
    res[y] = layout.position[y]

    res[w] = layout.items > 0 ? layout.widths[layout.item_index] : layout.size[x]
    res[y] = layout.size[y]

    if (res[w] === 0) {
      res[w] = style.size[x] + style.padding * 2;
    }
    if (res[h] === 0) {
      res[h] = style.size[y] + style.padding * 2;
    }
    if (res[w] < 0) {
      res[w] += layout.body[w] - res[x] + 1;
    }
    if (res[h] < 0) {
      res[h] += layout.body[h] - res[y] + 1;
    }

    layout.item_index++
  }

  /* update position */
  layout.position[x] += res[w] + style.spacing;
  layout.next_row = mu_max(layout.next_row, res[y] + res[h] + style.spacing);

  /* apply body offset */
  res[x] += layout.body[x];
  res[y] += layout.body[y];

  /* update max position */
  layout.max[x] = mu_max(layout.max[x], res[x] + res[w]);
  layout.max[y] = mu_max(layout.max[y], res[y] + res[h]);

  return (ctx.last_rect = res);
}

/*============================================================================
** controls
**============================================================================*/


function in_hover_root(ctx: mu_Context): Int {
  let i = ctx.container_stack.idx;
  while (i--) {
    if (ctx.container_stack.items[i] === ctx.hover_root) {
      return 1;
    }
    /* only root containers have their `head` field set; stop searching if we've
    ** reached the current root container */
    if (ctx.container_stack.items[i].head) {
      break;
    }
  }
  return 0;
}

function mu_draw_control_frame(ctx: mu_Context, id: mu_Id, rect: mu_Rect,
                               colorid: Int, opt: Int) {
  if (opt & MU_OPT_NOFRAME) {
    return;
  }
  const hov = (ctx.hover === id) ? 1 : 0
  colorid += (ctx.focus === id) ? 2 : hov;
  ctx.draw_frame(ctx, rect, colorid);
}


function mu_draw_control_text(ctx: mu_Context, str: string, rect: mu_Rect,
                              colorid: Int, opt: Int) {
  let pos: mu_Vec2 = [0, 0];
  let font = ctx.style.font;
  let tw: Int = ctx.text_width(font, str);
  mu_push_clip_rect(ctx, rect);
  pos[y] = rect[y] + (rect[h] - ctx.text_height(font)) / 2;
  if (opt & MU_OPT_ALIGNCENTER) {
    pos[x] = rect[x] + (rect[w] - tw) / 2;
  } else if (opt & MU_OPT_ALIGNRIGHT) {
    pos[x] = rect[x] + rect[w] - tw - ctx.style.padding;
  } else {
    pos[x] = rect[x] + ctx.style.padding;
  }
  mu_draw_text(ctx, font, str, pos, ctx.style.colors[colorid]);
  mu_pop_clip_rect(ctx);
}

function mu_mouse_over(ctx: mu_Context, rect: mu_Rect) {
  return rect_overlaps_vec2(rect, ctx.mouse_pos) &&
    rect_overlaps_vec2(mu_get_clip_rect(ctx), ctx.mouse_pos) &&
    in_hover_root(ctx);
}

function mu_update_control(ctx: mu_Context, id: mu_Id, rect: mu_Rect, opt: Int) {
  const mouseover = mu_mouse_over(ctx, rect);

  if (ctx.focus === id) {
    ctx.updated_focus = 1;
  }
  if (opt & MU_OPT_NOINTERACT) {
    return;
  }
  if (mouseover && !ctx.mouse_down) {
    ctx.hover = id;
  }

  if (ctx.focus === id) {
    if (ctx.mouse_pressed && !mouseover) {
      mu_set_focus(ctx, 0);
    }
    if (!ctx.mouse_down && ~opt & MU_OPT_HOLDFOCUS) {
      mu_set_focus(ctx, 0);
    }
  }

  if (ctx.hover === id) {
    if (ctx.mouse_pressed) {
      mu_set_focus(ctx, id);
    } else if (!mouseover) {
      ctx.hover = 0;
    }
  }
}

function mu_text(ctx: mu_Context, text: string) {
  let start, end, p = 0;
  let width = -1;
  const font = ctx.style.font;
  let color = ctx.style.colors[MU_COLOR_TEXT];
  mu_layout_begin_column(ctx);
  mu_layout_row(ctx, 1, [width], ctx.text_height(font));
  do {
    let r = mu_layout_next(ctx);
    let w = 0;
    start = end = p;
    do {
      while (text[p] !== " " && text[p] !== '\n') {
        p++;
      }
      w += ctx.text_width(font, text.substring(start, p));
      if (w > r[w] && end != start) {
        break;
      }
      w += ctx.text_width(font, text[p]);
      end = p++;
    } while (text[end] !== '\n');
    mu_draw_text(ctx, font, text.substring(start, end), [r[x], r[y]], color);
    p = end + 1;
  } while (end < text.length);
  mu_layout_end_column(ctx);
}

function mu_label(ctx: mu_Context, text: string) {
  mu_draw_control_text(ctx, text, mu_layout_next(ctx), MU_COLOR_TEXT, 0);
}

function mu_button_ex(ctx: mu_Context, label: string, icon: Int, opt: Int) {
  let res: Int = 0;
  let id: mu_Id = label ? mu_get_id(ctx, label)
    : mu_get_id(ctx, icon + "");
  let r = mu_layout_next(ctx);
  mu_update_control(ctx, id, r, opt);
  /* handle click */
  if (ctx.mouse_pressed === MU_MOUSE_LEFT && ctx.focus === id) {
    res |= MU_RES_SUBMIT;
  }
  /* draw */
  mu_draw_control_frame(ctx, id, r, MU_COLOR_BUTTON, opt);
  if (label) {
    mu_draw_control_text(ctx, label, r, MU_COLOR_TEXT, opt);
  }
  if (icon) {
    mu_draw_icon(ctx, icon, r, ctx.style.colors[MU_COLOR_TEXT]);
  }
  return res;
}

function mu_checkbox(ctx: mu_Context, label: string, state: Int) {
  let res: Int = 0;
  let id: mu_Id = mu_get_id(ctx, state + "");
  let r = mu_layout_next(ctx);
  let box: mu_Rect = [r[x], r[y], r[h], r[h]];
  mu_update_control(ctx, id, r, 0);
  /* handle click */
  if (ctx.mouse_pressed === MU_MOUSE_LEFT && ctx.focus === id) {
    res |= MU_RES_CHANGE;
    //todo: side effects
    //*state = !*state;
  }
  /* draw */
  mu_draw_control_frame(ctx, id, box, MU_COLOR_BASE, 0);
  if (state) {
    mu_draw_icon(ctx, MU_ICON_CHECK, box, ctx.style.colors[MU_COLOR_TEXT]);
  }
  r = [r[x] + box[w], r[y], r[w] - box[w], r[h]];
  mu_draw_control_text(ctx, label, r, MU_COLOR_TEXT, 0);
  return res;
}

function mu_textbox_raw(ctx: mu_Context, buf: string, bufsz: Int, id: mu_Id, r: mu_Rect,
                        opt: Int) {
  let res: Int = 0;
  mu_update_control(ctx, id, r, opt | MU_OPT_HOLDFOCUS);

  if (ctx.focus === id) {
    /* handle text input */
    let len = buf.length;
    let n = mu_min(bufsz - len - 1, ctx.input_text.length);
    if (n > 0) {
      buf = ctx.input_text
      //memcpy(buf + len, ctx.input_text, n);
      len += n;
      //buf[len] = '\0';
      res |= MU_RES_CHANGE;
    }
    /* handle backspace */
    if (ctx.key_pressed & MU_KEY_BACKSPACE && len > 0) {
      /* skip utf-8 continuation bytes */
      //while ((buf[--len] & 0xc0)===0x80 && len > 0);
      //buf[len] = '\0';
      res |= MU_RES_CHANGE;
    }
    /* handle return */
    if (ctx.key_pressed & MU_KEY_RETURN) {
      mu_set_focus(ctx, 0);
      res |= MU_RES_SUBMIT;
    }
  }

  /* draw */
  mu_draw_control_frame(ctx, id, r, MU_COLOR_BASE, opt);
  if (ctx.focus === id) {
    const color = ctx.style.colors[MU_COLOR_TEXT];
    const font = ctx.style.font;
    const textw = ctx.text_width(font, buf);
    const texth = ctx.text_height(font);
    let ofx = r[w] - ctx.style.padding - textw - 1;
    let textx = r[x] + mu_min(ofx, ctx.style.padding);
    let texty = r[y] + (r[h] - texth) / 2;
    mu_push_clip_rect(ctx, r);
    mu_draw_text(ctx, font, buf, [textx, texty], color);
    mu_draw_rect(ctx, [textx + textw, texty, 1, texth], color);
    mu_pop_clip_rect(ctx);
  } else {
    mu_draw_control_text(ctx, buf, r, MU_COLOR_TEXT, opt);
  }

  return res;
}

/*
function number_textbox(ctx: mu_Context, mu_Real *value, mu_Rect r, id: mu_Id): Int {
  if (ctx.mouse_pressed===MU_MOUSE_LEFT && ctx.key_down & MU_KEY_SHIFT &&
  ctx.hover===id
) {
    ctx.number_edit = id;
    sprintf(ctx.number_edit_buf, MU_REAL_FMT, *value);
  }
  if (ctx.number_edit===id) {
    int res = mu_textbox_raw(
      ctx, ctx.number_edit_buf, sizeof(ctx.number_edit_buf), id, r, 0);
    if (res & MU_RES_SUBMIT || ctx.focus != id) {
    *value = strtod(ctx.number_edit_buf, NULL);
      ctx.number_edit = 0;
    } else {
      return 1;
    }
  }
  return 0;
}
*/

function mu_textbox_ex(ctx: mu_Context, buf: string, bufsz: Int, opt: Int) {
  let id: mu_Id = mu_get_id(ctx, buf + "");
  let r = mu_layout_next(ctx);
  return mu_textbox_raw(ctx, buf, bufsz, id, r, opt);
}

//
// function mu_slider_ex(ctx: mu_Context, mu_Real *value, mu_Real low, mu_Real high,
//   mu_Real step, const char *fmt, opt: Int)
// {
//   char buf[MU_MAX_FMT + 1];
//   mu_Rect thumb;
//   int x, w, res = 0;
//   mu_Real last = *value, v = last;
//   id: mu_Id = mu_get_id(ctx, &value, sizeof(value));
//   mu_Rect base = mu_layout_next(ctx);
//
//   /* handle text input mode */
//   if (number_textbox(ctx, &v, base, id)) { return res; }
//
//   /* handle normal mode */
//   mu_update_control(ctx, id, base, opt);
//
//   /* handle input */
//   if (ctx.focus===id &&
//     (ctx.mouse_down | ctx.mouse_pressed)===MU_MOUSE_LEFT)
//   {
//     v = low + (ctx.mouse_pos[x] - base[x]) * (high - low) / base[w];
//     if (step) { v = (((v + step / 2) / step)) * step; }
//   }
//   /* clamp and store value, update res */
// *value = v = mu_clamp(v, low, high);
//   if (last != v) { res |= MU_RES_CHANGE; }
//
//   /* draw base */
//   mu_draw_control_frame(ctx, id, base, MU_COLOR_BASE, opt);
//   /* draw thumb */
//   w = ctx.style.thumb_size;
//   x = (v - low) * (base[w] - w) / (high - low);
//   thumb = mu_rect(base[x] + x, base[y], w, base[h]);
//   mu_draw_control_frame(ctx, id, thumb, MU_COLOR_BUTTON, opt);
//   /* draw text  */
//   sprintf(buf, fmt, v);
//   mu_draw_control_text(ctx, buf, base, MU_COLOR_TEXT, opt);
//
//   return res;
// }

//
// function mu_number_ex(ctx: mu_Context, mu_Real *value, mu_Real step,
// const char *fmt, opt: Int)
// {
//   char buf[MU_MAX_FMT + 1];
//   int res = 0;
//   id: mu_Id = mu_get_id(ctx, &value, sizeof(value));
//   mu_Rect base = mu_layout_next(ctx);
//   mu_Real last = *value;
//
//   /* handle text input mode */
//   if (number_textbox(ctx, value, base, id)) { return res; }
//
//   /* handle normal mode */
//   mu_update_control(ctx, id, base, opt);
//
//   /* handle input */
//   if (ctx.focus===id && ctx.mouse_down===MU_MOUSE_LEFT) {
// *value += ctx.mouse_delta[x] * step;
// }
//   /* set flag if value changed */
//   if (*value != last) { res |= MU_RES_CHANGE; }
//
//   /* draw base */
//   mu_draw_control_frame(ctx, id, base, MU_COLOR_BASE, opt);
//   /* draw text  */
//   sprintf(buf, fmt, *value);
//   mu_draw_control_text(ctx, buf, base, MU_COLOR_TEXT, opt);
//
//   return res;
// }

//
// function header(ctx: mu_Context, const char *label, int istreenode, opt: Int) :Int {
//   mu_Rect r;
//   int active, expanded;
//   id: mu_Id = mu_get_id(ctx, label, strlen(label));
//   int idx = mu_pool_get(ctx, ctx.treenode_pool, MU_TREENODEPOOL_SIZE, id);
//   int width = -1;
//   mu_layout_row(ctx, 1, &width, 0);
//
//   active = (idx >= 0);
//   expanded = (opt & MU_OPT_EXPANDED) ? !active : active;
//   r = mu_layout_next(ctx);
//   mu_update_control(ctx, id, r, 0);
//
//   /* handle click */
//   active ^= (ctx.mouse_pressed===MU_MOUSE_LEFT && ctx.focus===id);
//
//   /* update pool ref */
//   if (idx >= 0) {
//     if (active) { mu_pool_update(ctx, ctx.treenode_pool, idx); }
//     else { memset(&ctx.treenode_pool[idx], 0, sizeof(mu_PoolItem)); }
//   } else if (active) {
//     mu_pool_init(ctx, ctx.treenode_pool, MU_TREENODEPOOL_SIZE, id);
//   }
//
//   /* draw */
//   if (istreenode) {
//     if (ctx[h]over===id) { ctx.draw_frame(ctx, r, MU_COLOR_BUTTONHOVER); }
//   } else {
//     mu_draw_control_frame(ctx, id, r, MU_COLOR_BUTTON, 0);
//   }
//   mu_draw_icon(
//     ctx, expanded ? MU_ICON_EXPANDED : MU_ICON_COLLAPSED,
//     mu_rect(r[x], r[y], r[h], r[h]), ctx.style.colors[MU_COLOR_TEXT]);
//   r[x] += r[h] - ctx.style.padding;
//   r[w] -= r[h] - ctx.style.padding;
//   mu_draw_control_text(ctx, label, r, MU_COLOR_TEXT, 0);
//
//   return expanded ? MU_RES_ACTIVE : 0;
// }
//
//
// function mu_header_ex(ctx: mu_Context, const char *label, opt: Int) {
//   return header(ctx, label, 0, opt);
// }
//
//
// function mu_begin_treenode_ex(ctx: mu_Context, const char *label, opt: Int) {
//   int res = header(ctx, label, 1, opt);
//   if (res & MU_RES_ACTIVE) {
//     get_layout(ctx).indent += ctx.style.indent;
//     push(ctx.id_stack, ctx.last_id);
//   }
//   return res;
// }
//
//
// function mu_end_treenode(ctx: mu_Context) {
//   get_layout(ctx).indent -= ctx.style.indent;
//   mu_pop_id(ctx);
// }

export const foo = 2