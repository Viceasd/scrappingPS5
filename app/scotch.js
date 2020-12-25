const _ = require('lodash');

// Import helper functions 
const {
	compose,
	composeAsync,
	extractNumber,
	enforceHttpsUrl,
	fetchHtmlFromUrl,
	extractFromElems,
	fromPairsToObject,
	fetchElemInnerText,
	fetchElemAttribute,
	extractUrlAttribute
} = require("./helpers");

// scotch.io (Base URL)
const SCOTCH_BASE = "https://scotch.io";
const PCFACTORY_URL = "https://www.pcfactory.cl/producto/39192-sony-consola-playstation-5-ps5";
//const PCFACTORY_URL = "https://www.pcfactorysdfgdfgdf.cl/producto/39192-sony-consola-playstation-5-ps5";
// hacer const del resto de las urls
//const LIDER_URL = "https://www.pcfactory.cl/producto/39192-sony-consola-playstation-5-ps5";
const LIDER_URL = "https://www.lider.cl/catalogo/product/sku/1086920";
const PARIS_URL = "https://www.paris.cl/consola-ps5-440437999.html";
const MICROPLAY_URL = "https://www.microplay.cl/producto/consola-ps5-sony/";
const ZMART_URL = "https://www.zmart.cl/scripts/prodView.asp?idProduct=78812";
const FALABELLA_URL = "https://www.falabella.com/falabella-cl/product/14483343/Preventa-PlayStation-5/14483343";
const LA_POLAR_URL = "https://www.lapolar.cl/consola-sony-playstation-5/23395401.html";
const RIPLEY_URL ="https://simple.ripley.cl/tecno/mundo-gamer/consolas?source=menu&facet=mfName_ntk_cs%253A%2522SONY%2522"; 
const WE_PLAY_URL = "https://www.weplay.cl/ps5?utm_source=banner%20home&utm_medium=organico&utm_campaign=landing%20ps5%20banner%20home";
const SONY_URL = "https://store.sony.cl/playstation5/p";
///////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Resolves the url as relative to the base scotch url
 * and returns the full URL
 */
const scotchRelativeUrl = url =>
	_.isString(url) ? `${PCFACTORY_URL}${url.replace(/^\/*?/, "/")}` : null;

/**
 * A composed function that extracts a url from element attribute,
 * resolves it to the Scotch base url and returns the url with https
 */
const extractScotchUrlAttribute = attr =>
	compose(enforceHttpsUrl, scotchRelativeUrl, fetchElemAttribute(attr));

///////////////////////////////////////////////////////////////////////////////
// EXTRACTION FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Extract a single social URL pair from container element
 */
const extractSocialUrl = elem => {
	const icon = elem.find("span.icon");
	const regex = /^(?:icon|color)-(.+)$/;

	const onlySocialClasses = regex => (classes = "") => classes
			.replace(/\s+/g, " ")
			.split(" ")
			.filter(classname => regex.test(classname));

	const getSocialFromClasses = regex => classes => {
		let social = null;
		const [classname = null] = classes;

		if (_.isString(classname)) {
			const [, name = null] = classname.match(regex);
			social = name ? _.snakeCase(name) : null;
		}

		return social;
	};

	const href = extractUrlAttribute("href")(elem);

	const social = compose(
		getSocialFromClasses(regex),
		onlySocialClasses(regex),
		fetchElemAttribute("class")
	)(icon);

	return social && { [social]: href };
};

/**
 * Extract a single post from container element
 */
const extractPost = elem => {
	const title = elem.find('.card__title a');
	const image = elem.find('a[data-src]');
	const views = elem.find("a[title='Views'] span");
	const comments = elem.find("a[title='Comments'] span.comment-number");

	return {
		title: fetchElemInnerText(title),
		image: extractUrlAttribute('data-src')(image),
		url: extractScotchUrlAttribute('href')(title),
		views: extractNumber(views),
		comments: extractNumber(comments)
	};
};

/**
 * Extract a single stat from container element
 */
const extractStat = elem => {
	const statElem = elem.find(".stat")
	const labelElem = elem.find('.label');

	const lowercase = val => _.isString(val) ? val.toLowerCase() : null;

	const stat = extractNumber(statElem);
	const label = compose(lowercase, fetchElemInnerText)(labelElem);

	return { [label]: stat };
};

/**
 * Extract profile from a Scotch author's page using the Cheerio parser instance
 * and returns the author profile object
 */
const extractAuthorProfile = $ => {

	const mainSite = $('#site__main');
	const metaScotch = $("meta[property='og:url']");
	const scotchHero = mainSite.find('section.hero--scotch');
	const superGrid = mainSite.find('section.super-grid');

	const authorTitle = scotchHero.find(".profile__name h1.title");
	const profileRole = authorTitle.find(".tag");
	const profileAvatar = scotchHero.find("img.profile__avatar");
	const profileStats = scotchHero.find(".profile__stats .profile__stat");
	const authorLinks = scotchHero.find(".author-links a[target='_blank']");
	const authorPosts = superGrid.find(".super-grid__item [data-type='post']");

	const extractPosts = extractFromElems(extractPost)();
	const extractStats = extractFromElems(extractStat)(fromPairsToObject);
	const extractSocialUrls = extractFromElems(extractSocialUrl)(fromPairsToObject);

	return Promise.all([
		fetchElemInnerText(authorTitle.contents().first()),
		fetchElemInnerText(profileRole),
		extractUrlAttribute('content')(metaScotch),
		extractUrlAttribute('src')(profileAvatar),
		extractSocialUrls(authorLinks)($),
		extractStats(profileStats)($),
		extractPosts(authorPosts)($)
	]).then(([ author, role, url, avatar, social, stats, posts ]) => ({ author, role, url, avatar, social, stats, posts }));

};

const extractPageProfile = $ => {
	const noEncuentraDato = $("#center > div.contenido-center > div > div > div > div.ficha_titulos > h1");
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		fetchElemInnerText(noEncuentraDato.contents().first()),
		extractUrlAttribute('content')(metaUrl),
		PCFACTORY_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }));

};
// crear extracpageprofile de cada uno de las paginas que se necesita

const extractLiderProfile = $ => {

	const mainSite = $('#site__main');
	//const noEncuentraDato = $("#error-information-popup-content > div.error-code");
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		//fetchElemInnerText(noEncuentraDato.contents().first()),
		extractUrlAttribute('content')(metaUrl),
		LIDER_URL
	]).then(([ url,urlCompleta]) => ({ url,urlCompleta }));

};
const extractParisProfile = $ => {

	const mainSite = $('#site__main');
	const noEncuentraDato = $("#wrapper");
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		fetchElemInnerText(noEncuentraDato.contents().first()),
		extractUrlAttribute('content')(metaUrl),
        PARIS_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }))
	;

};

const extractMicroPlayProfile = $ => {

	const mainSite = $('#site__main');
	const metaUrl = $("meta[property='og:url']");
	const paginaHtml = fetchHtmlFromUrl(MICROPLAY_URL);

	const extractPosts = extractFromElems(extractPost)();
	const extractStats = extractFromElems(extractStat)(fromPairsToObject);
	const extractSocialUrls = extractFromElems(extractSocialUrl)(fromPairsToObject);

	return Promise.all([
		mainSite,
		extractUrlAttribute('content')(metaUrl),
		MICROPLAY_URL,
		paginaHtml
	]).then(([ pagina, url, urlCompleta,stringHtml ]) => ({  pagina, url, urlCompleta,stringHtml }));

};

const extractZmartProfile = $ => {

	const mainSite = $('#site__main');
   // console('holi: '+mainSite);
	const agotado = $("#ficha_producto_int > div.txTituloRef.dv260px");
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		fetchElemInnerText(agotado.contents().first()),
		extractUrlAttribute('content')(metaUrl),
		ZMART_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }));

};

const extractFalabellaProfile = $ => {
	const noEncuentraDato = $("#testId-product-outofstock > div.jsx-1613262311.heading > h2");
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		fetchElemInnerText(noEncuentraDato.contents().first()),
		extractUrlAttribute('content')(metaUrl),
		FALABELLA_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }));

};

const extractLaPolarProfile = $ => {
	const noEncuentraDato = $("body > div.page > div.ms-contain-desktoplarge.pdp-wrapper.product-wrapper.product-detail > div.ms-row.pdp-image-and-detail.ms-margin-hp.collapsed.product-detail > div.pdp-right-content.details-container.col-xs-12.col-sm.ms-no-padding.js-details-container > div > div.ms-row.collapsed.quantity-and-add-to-cart > div.col-xs-12.col-sm.ms-no-padding.add-to-cart-actions > div > div > button");
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		fetchElemInnerText(noEncuentraDato.contents().first()),
		extractUrlAttribute('content')(metaUrl),
		LA_POLAR_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }));

};

const extractWePlayProfile = $ => {
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		extractUrlAttribute('content')(metaUrl),
		WE_PLAY_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }));

};

const extractSonyProfile = $ => {
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		extractUrlAttribute('content')(metaUrl),
		SONY_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }));

};

const extractRipleyProfile = $ => {
	const metaUrl = $("meta[property='og:url']");

	return Promise.all([
		extractUrlAttribute('content')(metaUrl),
		RIPLEY_URL
	]).then(([ data,url,urlCompleta]) => ({ data,url,urlCompleta }));

};

/**
 * Fetches the Scotch profile of the given author
 */
const fetchAuthorProfile = author => {
	const AUTHOR_URL = `${SCOTCH_BASE}/@${author.toLowerCase()}`;
	return composeAsync(extractAuthorProfile, fetchHtmlFromUrl)(AUTHOR_URL);
};


// aca crear otros fetchPAginaDondeVendernProfile
const fetchPCFactoryProfile = $ =>{
	return composeAsync(extractPageProfile, fetchHtmlFromUrl)(PCFACTORY_URL);
};

const fetchLiderProfile = $ =>{
	return composeAsync(extractLiderProfile, fetchHtmlFromUrl)(LIDER_URL);
};

const fetchParisProfile = $ =>{
	return composeAsync(extractParisProfile, fetchHtmlFromUrl)(PARIS_URL);
};

const fetchMicroPlayProfile = $ =>{
	return composeAsync(extractMicroPlayProfile, fetchHtmlFromUrl)(MICROPLAY_URL);
};

const fetchZmartProfile = $ =>{
	return composeAsync(extractZmartProfile, fetchHtmlFromUrl)(ZMART_URL);
};

const fetchFalabellaProfile = $ =>{
	return composeAsync(extractFalabellaProfile, fetchHtmlFromUrl)(FALABELLA_URL);
};

const fetchLaPolarProfile = $ =>{
	return composeAsync(extractLaPolarProfile, fetchHtmlFromUrl)(LA_POLAR_URL);
};

const fetchWePlayProfile = $ =>{
	return composeAsync(extractWePlayProfile, fetchHtmlFromUrl)(WE_PLAY_URL);
};
const fetchSonyProfile = $ =>{
	return composeAsync(extractSonyProfile, fetchHtmlFromUrl)(SONY_URL);
};
const fetchRipleyProfile = $ =>{
	return composeAsync(extractRipleyProfile, fetchHtmlFromUrl)(RIPLEY_URL);
};

// aca dejar los profile que agregar
module.exports = { fetchAuthorProfile,fetchPCFactoryProfile,fetchLiderProfile,fetchParisProfile,
				   fetchMicroPlayProfile, fetchZmartProfile, fetchFalabellaProfile,fetchLaPolarProfile,
				   fetchWePlayProfile,fetchSonyProfile,fetchRipleyProfile
                };






