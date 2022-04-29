import { defineStore } from 'pinia';

interface IElement {
  type: string;
  size?: number;
  props?: Record<string, unknown>;
}

interface View {
  id: string;
  name: string;
  elements: IElement[];
}

const desktopViews: View[] = [
  {
    id: 'summary',
    name: 'Summary',
    elements: [
      { type: 'top_apps', size: 3 },
      { type: 'top_titles', size: 3 },
      { type: 'timeline_barchart', size: 3 },
      { type: 'top_categories', size: 3 },
      { type: 'category_tree', size: 3 },
      { type: 'category_sunburst', size: 3 },
    ],
  },
  {
    id: 'window',
    name: 'Window',
    elements: [
      { type: 'top_apps', size: 3 },
      { type: 'top_titles', size: 3 },
    ],
  },
  {
    id: 'browser',
    name: 'Browser',
    elements: [
      { type: 'top_domains', size: 3 },
      { type: 'top_urls', size: 3 },
    ],
  },
  {
    id: 'editor',
    name: 'Editor',
    elements: [
      { type: 'top_editor_files', size: 3 },
      { type: 'top_editor_projects', size: 3 },
      { type: 'top_editor_languages', size: 3 },
    ],
  },
];

const androidViews = [
  {
    id: 'summary',
    name: 'Summary',
    elements: [
      { type: 'top_apps', size: 3 },
      { type: 'top_categories', size: 3 },
      { type: 'timeline_barchart', size: 3 },
      { type: 'category_tree', size: 3 },
      { type: 'category_sunburst', size: 3 },
    ],
  },
];

// FIXME: Decide depending on what kind of device is being viewed, not from which device it is being viewed.
const defaultViews = !process.env.VUE_APP_ON_ANDROID ? desktopViews : androidViews;

interface State {
  views: View[];
}

export const useViewsStore = defineStore('views', {
  state: (): State => ({
    views: [],
  }),
  getters: {
    getViewById: state => (id: string) => state.views.find(view => view.id === id),
  },
  actions: {
    async load() {
      let views: View[];
      if (typeof localStorage !== 'undefined') {
        const views_json = localStorage.views;
        if (views_json && views_json.length >= 1) {
          views = JSON.parse(views_json);
        }
      }
      if (!views) {
        views = defaultViews;
      }
      this.loadViews(views);
    },
    async save() {
      localStorage.views = JSON.stringify(this.views);
      // After save, reload views from localStorage
      await this.load();
    },
    loadViews(views: View[]) {
      this.$patch({ views });
      console.log('Loaded views:', this.views);
    },
    clearViews(state: State) {
      state.views = [];
    },
    setElements(state: State, { view_id, elements }) {
      state.views.find(v => v.id == view_id).elements = elements;
    },
    restoreDefaults(state: State) {
      state.views = defaultViews;
    },
    addView(view: View) {
      this.views.push({ ...view, elements: [] });
    },
    removeView({ view_id }) {
      const idx = this.views.map(v => v.id).indexOf(view_id);
      this.views.splice(idx, 1);
    },
    editView({ view_id, el_id, type, props }) {
      console.log(view_id, el_id, type, props);
      console.log(this.views);
      const element = this.views.find(v => v.id == view_id).elements[el_id];
      element.type = type;
      element.props = props;
    },
    addVisualization({ view_id, type }) {
      this.views.find(v => v.id == view_id).elements.push({ type: type });
    },
    removeVisualization({ view_id, el_id }) {
      this.views.find(v => v.id == view_id).elements.splice(el_id, 1);
    },
  },
});
