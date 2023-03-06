/**
 * @typedef GaOptions
 * @type {Object}
 * @property {boolean} [cookieUpdate=true]
 * @property {number} [cookieExpires=63072000] Default two years
 * @property {string} [cookieDomain="auto"]
 * @property {string} [cookieFlags]
 * @property {string} [userId]
 * @property {string} [clientId]
 * @property {boolean} [anonymizeIp]
 * @property {string} [contentGroup1]
 * @property {string} [contentGroup2]
 * @property {string} [contentGroup3]
 * @property {string} [contentGroup4]
 * @property {string} [contentGroup5]
 * @property {boolean} [allowAdFeatures=true]
 * @property {boolean} [allowAdPersonalizationSignals]
 * @property {boolean} [nonInteraction]
 * @property {string} [page]
 */
/**
 * @typedef UaEventOptions
 * @type {Object}
 * @property {string} action
 * @property {string} category
 * @property {string} [label]
 * @property {number} [value]
 * @property {boolean} [nonInteraction]
 * @property {('beacon'|'xhr'|'image')} [transport]
 */
/**
 * @typedef InitOptions
 * @type {Object}
 * @property {string} trackingId
 * @property {GaOptions|any} [gaOptions]
 * @property {Object} [gtagOptions] New parameter
 */
export class GA4 {
    reset: () => void;
    isInitialized: boolean;
    _testMode: boolean;
    _hasLoadedGA: boolean;
    _isQueuing: boolean;
    _queueGtag: any[];
    _gtag: (...args: any[]) => void;
    gtag(...args: any[]): void;
    _loadGA: (GA_MEASUREMENT_ID: any, nonce: any, gtagUrl?: string) => void;
    _toGtagOptions: (gaOptions: any) => {};
    /**
     *
     * @param {InitOptions[]|string} GA_MEASUREMENT_ID
     * @param {Object} [options]
     * @param {string} [options.nonce]
     * @param {boolean} [options.testMode=false]
     * @param {string} [options.gtagUrl=https://www.googletagmanager.com/gtag/js]
     * @param {GaOptions|any} [options.gaOptions]
     * @param {Object} [options.gtagOptions] New parameter
     */
    initialize: (GA_MEASUREMENT_ID: InitOptions[] | string, options?: {
        nonce?: string;
        testMode?: boolean;
        gtagUrl?: string;
        gaOptions?: GaOptions | any;
        gtagOptions?: any;
    }) => void;
    _currentMeasurementId: string;
    set: (fieldsObject: any) => void;
    _gaCommandSendEvent: (eventCategory: any, eventAction: any, eventLabel: any, eventValue: any, fieldsObject: any) => void;
    _gaCommandSendEventParameters: (...args: any[]) => void;
    _gaCommandSendTiming: (timingCategory: any, timingVar: any, timingValue: any, timingLabel: any) => void;
    _gaCommandSendPageview: (page: any, fieldsObject: any) => void;
    _gaCommandSendPageviewParameters: (...args: any[]) => void;
    _gaCommandSend: (...args: any[]) => void;
    _gaCommandSet: (...args: any[]) => void;
    _gaCommand: (command: any, ...args: any[]) => void;
    ga: (...args: any[]) => any;
    /**
     * @param {UaEventOptions|string} optionsOrName
     * @param {Object} [params]
     */
    event: (optionsOrName: UaEventOptions | string, params?: any) => void;
    send: (fieldObject: any) => void;
}
declare const _default: GA4;
export default _default;
export type GaOptions = {
    cookieUpdate?: boolean;
    /**
     * Default two years
     */
    cookieExpires?: number;
    cookieDomain?: string;
    cookieFlags?: string;
    userId?: string;
    clientId?: string;
    anonymizeIp?: boolean;
    contentGroup1?: string;
    contentGroup2?: string;
    contentGroup3?: string;
    contentGroup4?: string;
    contentGroup5?: string;
    allowAdFeatures?: boolean;
    allowAdPersonalizationSignals?: boolean;
    nonInteraction?: boolean;
    page?: string;
};
export type UaEventOptions = {
    action: string;
    category: string;
    label?: string;
    value?: number;
    nonInteraction?: boolean;
    transport?: ('beacon' | 'xhr' | 'image');
};
export type InitOptions = {
    trackingId: string;
    gaOptions?: GaOptions | any;
    /**
     * New parameter
     */
    gtagOptions?: any;
};
