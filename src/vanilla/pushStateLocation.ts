import { services, isDefined } from '../common/module';
import { LocationConfig, LocationServices } from '../common/coreservices';
import { splitQuery, trimHashVal, getParams, locationPluginFactory } from './utils';
import { LocationPlugin } from "./interface";
import { UIRouter } from "../router";

let hashPrefix: string = '';
let baseHref: string = '';

export const pushStateLocationConfig: LocationConfig = {
  port: () =>
      parseInt(location.port),
  protocol: () =>
      location.protocol,
  host: () =>
      location.host,
  baseHref: () =>
      baseHref,
  html5Mode: () =>
      true,
  hashPrefix: (newprefix?: string): string => {
    if (isDefined(newprefix)) {
      hashPrefix = newprefix;
    }
    return hashPrefix;
  }
};

export const pushStateLocationService: LocationServices = {
  hash: () =>
      trimHashVal(location.hash),
  path: () => {
    let base = services.locationConfig.baseHref();
    let path = location.pathname;
    let idx = path.indexOf(base);
    if (idx !== 0) throw new Error(`current url: ${path} does not start with <base> tag ${base}`);
    return path.substr(base.length);
  },
  search: () =>
      getParams(splitQuery(location.search)[1]),
  setUrl: (url: string, replace: boolean = false) => {
    if (isDefined(url)) {
      if (replace) history.replaceState(null, null, services.locationConfig.baseHref() + url);
      else history.pushState(null, null, services.locationConfig.baseHref() + url);
    }
  },
  onChange: (cb: EventListener) => {
    window.addEventListener("popstate", cb, false);
    return () => window.removeEventListener("popstate", cb);
  }
};

export const pushStateLocationPlugin: (router: UIRouter) => LocationPlugin =
    locationPluginFactory("vanilla.pushStateLocation", pushStateLocationService, pushStateLocationConfig);
