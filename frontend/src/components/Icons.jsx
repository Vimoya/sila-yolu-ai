const Ic = ({ children, size = 20, style, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style} className={`sy-ic${className ? ' ' + className : ''}`} aria-hidden>
    {children}
  </svg>
);

export const IconRoute   = (p) => <Ic {...p}><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="5" r="2.2"/><path d="M6 17V11a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4"/></Ic>;
export const IconFuel    = (p) => <Ic {...p}><path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M3 21h13"/><path d="M15 10h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-2-2"/><path d="M7 7h5v4H7z"/></Ic>;
export const IconCalc    = (p) => <Ic {...p}><rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7h8"/><path d="M8 12h2M13 12h3M8 16h2M13 16h3"/></Ic>;
export const IconChat    = (p) => <Ic {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.8A8 8 0 1 1 21 12z"/></Ic>;
export const IconList    = (p) => <Ic {...p}><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="18" r="1"/></Ic>;
export const IconUser    = (p) => <Ic {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Ic>;
export const IconMap     = (p) => <Ic {...p}><path d="M9 5 3 7v12l6-2 6 2 6-2V5l-6 2z"/><path d="M9 5v12M15 7v12"/></Ic>;
export const IconPin     = (p) => <Ic {...p}><path d="M12 22s-7-7.5-7-13a7 7 0 1 1 14 0c0 5.5-7 13-7 13z"/><circle cx="12" cy="9" r="2.6"/></Ic>;
export const IconCar     = (p) => <Ic {...p}><path d="M5 17v-3l2-5h10l2 5v3"/><path d="M3 17h18v3H3z"/><circle cx="7" cy="17" r="1.5"/><circle cx="17" cy="17" r="1.5"/></Ic>;
export const IconBolt    = (p) => <Ic {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></Ic>;
export const IconCheck   = (p) => <Ic {...p}><path d="M4 12l5 5L20 6"/></Ic>;
export const IconClock   = (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></Ic>;
export const IconShield  = (p) => <Ic {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/></Ic>;
export const IconSearch  = (p) => <Ic {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Ic>;
export const IconArrow   = (p) => <Ic {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Ic>;
export const IconChevron = (p) => <Ic {...p}><path d="m9 6 6 6-6 6"/></Ic>;
export const IconBell    = (p) => <Ic {...p}><path d="M6 17V11a6 6 0 1 1 12 0v6"/><path d="M4 17h16M10 21h4"/></Ic>;
export const IconStar    = (p) => <Ic {...p}><path d="m12 3 2.6 6 6.4.5-4.9 4.3 1.6 6.4L12 17l-5.7 3.2L7.9 13.8 3 9.5 9.4 9z"/></Ic>;
export const IconLock    = (p) => <Ic {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></Ic>;
export const IconMail    = (p) => <Ic {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></Ic>;
export const IconGoogle  = (p) => (
  <Ic {...p}>
    <path d="M21 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.1c-.2 1.3-.9 2.4-2 3.1v2.6h3.2c1.9-1.7 2.7-4.2 2.7-7.7z" stroke="none" fill="#4DA8FF"/>
    <path d="M12 22c2.7 0 4.9-.9 6.5-2.4l-3.2-2.5c-.9.6-2 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.3v2.5A10 10 0 0 0 12 22z" stroke="none" fill="#38E58A"/>
    <path d="M6.6 14.1c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.8H3.3a10 10 0 0 0 0 8.5z" stroke="none" fill="#FF8A3D"/>
    <path d="M12 6.2c1.4 0 2.7.5 3.7 1.5L18.6 5C16.9 3.4 14.7 2.4 12 2.4A10 10 0 0 0 3.3 7.8l3.3 2.5c.7-2.3 2.9-4.1 5.4-4.1z" stroke="none" fill="#E854A8"/>
  </Ic>
);
export const IconPlus    = (p) => <Ic {...p}><path d="M12 5v14M5 12h14"/></Ic>;
export const IconHeart   = (p) => <Ic {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></Ic>;
export const IconCamera  = (p) => <Ic {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.6"/><path d="M9 7l1.5-2h3L15 7"/></Ic>;
export const IconGlobe   = (p) => <Ic {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Ic>;
export const IconFlag    = (p) => <Ic {...p}><path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/></Ic>;
export const IconCardSm  = (p) => <Ic {...p}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 14h3"/></Ic>;
