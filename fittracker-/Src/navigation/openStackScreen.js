/**
 * Navigate to a screen on the root stack from inside a tab (or nested) navigator.
 */
export function openStackScreen(navigation, routeName, params) {
  let nav = navigation;
  while (nav) {
    const names = nav.getState?.()?.routeNames;
    if (names?.includes(routeName)) {
      nav.navigate(routeName, params);
      return;
    }
    nav = nav.getParent?.();
  }
  navigation.navigate(routeName, params);
}
