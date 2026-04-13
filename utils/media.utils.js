import slugify from "slugify";

export const normalizeNamespace = (ns = "") => {
  return ns
    .toLowerCase()
    .trim()
    .replace(/\/+/g, "/")      // fix multiple slashes
    .replace(/^\/|\/$/g, "");  // remove leading/trailing slash
};


export const generateUniqueSlug = (slug, title) => {
  const baseSlug = slug || slugify(title || "untitled", { lower: true });
  return `${baseSlug}-${Date.now()}`;
};


export const isNamespaceValid = (ns)=>{
  return(/^[a-z0-9-_\/]+$/.test(namespace))
}