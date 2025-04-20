import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("./login/login.tsx"),
    route("dashboard", "./dashboard/dashboard.tsx"),
    route("new", "./new/new.tsx")
] satisfies RouteConfig;
