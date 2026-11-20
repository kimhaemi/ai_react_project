import { AllCommunityModule, ModuleRegistry, themeQuartz } from "ag-grid-community";

// 이 파일이 import 될 때 한 번만 실행됨 (모든 그리드 공통)
ModuleRegistry.registerModules([AllCommunityModule]);

/** 공통 테마. 색상/폰트 등은 여기서 한 번에 바꾸면 모든 그리드에 반영됨 */
export const gridTheme = themeQuartz.withParams({
  fontFamily: "inherit",
  headerFontWeight: 600,
});
