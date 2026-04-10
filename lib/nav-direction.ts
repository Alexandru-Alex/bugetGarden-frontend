// Ordinea vizuală stânga → dreapta
const TAB_ORDER = ["/garden", "/dashboard", "/statistics"];

let _isForward = true;

export const NavTransition = {
  isForward: () => _isForward,
  setDirection: (from: string, to: string) => {
    const fi = TAB_ORDER.findIndex(p => from === p || from.startsWith(p + "/"));
    const ti = TAB_ORDER.findIndex(p => to === p || to.startsWith(p + "/"));
    // Dacă ruta nu e în TAB_ORDER (e.g. settings), mergem "înainte"
    _isForward = fi < 0 || ti < 0 || ti >= fi;
  },
};
