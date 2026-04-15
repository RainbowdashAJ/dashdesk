# PonyVille-School-Management 校园管理系统（前端）

PonyVille-School-Management 是一款以《My Little Pony（小马宝莉）》为主题的校园综合管理系统前端项目，基于 Vue 3 + Vite 构建，覆盖学科、部门、班级等多维度校园核心业务模块，提供标准化的增删改查（CRUD）、详情回显、分页查询等功能，兼具主题化视觉设计与规范化的前端工程化实现。

## 项目简介

### 核心定位

面向校园管理场景的一站式前端解决方案，聚焦学科、部门、班级等核心管理模块，实现业务数据的全生命周期管理，适配校园管理的实际业务流程，同时通过小马宝莉主题风格降低操作门槛、提升使用体验。

### 技术栈核心

| 技术 / 工具 | 版本 / 核心用途 |
|------------|----------------|
| 前端框架 | Vue 3（Composition API + `<script setup>`） |
| 构建工具 | Vite（极速热更新、轻量化打包） |
| 路由管理 | Vue Router 4（页面路由配置 / 权限控制） |
| 网络请求 | Axios（封装统一请求工具，含拦截器） |
| 代码规范 | ESLint + Prettier（可选，保证代码风格统一） |
| 运行环境 | Node.js ≥ 16.x（推荐 LTS 版本） |

## 核心业务模块

| 模块名称 | 核心功能 |
|---------|----------|
| 学科管理（Subject） | 全量查询学科列表、新增学科、修改学科信息、删除指定学科、按 ID 查询学科（回显） |
| 部门管理（Dept） | 全量查询部门列表、新增部门、修改部门信息、删除指定部门、按 ID 查询部门（回显） |
| 班级管理（Clazz） | 条件分页查询班级、全量查询班级、详情查询、新增 / 编辑 / 删除班级（扩展模块） |
| （可扩展） | 成绩管理、权限管理等校园核心业务模块 |

## 快速开始

### 环境准备

- 安装 Node.js（推荐 v16.x 及以上版本），自带 npm 包管理工具；
- 开发工具推荐：VSCode + Volar 插件（禁用 Vetur） + TypeScript Vue Plugin (Volar)；
- 确保后端接口服务已启动，且前端请求工具中配置的 baseURL 与后端地址一致。

### 安装与运行

```bash
# 克隆项目
自行复制克隆地址即可

# 安装项目依赖
npm install

# 启动开发环境（默认端口：5173，可在 vite.config.js 中修改）
npm run dev

# 生产环境打包（打包产物输出至 dist 目录）
npm run build

# （可选）ESLint 代码检查与自动修复
npm run lint

# 项目目录结构

```text
src/
├── api/                # 接口封装目录（按业务模块拆分）
│   ├── sub.js          # 学科管理接口（查询/新增/编辑/删除/回显）
│   ├── dept.js         # 部门管理接口（查询/新增/编辑/删除/回显）
│   ├── clazz.js        # 班级管理接口（分页/查询/新增/编辑/删除）
│   └── ...             # 其他业务模块接口
├── assets/             # 静态资源目录
│   ├── pony/           # 小马宝莉主题资源（图片/样式/字体）
│   ├── css/            # 全局样式
│   └── img/            # 通用图片资源
├── router/             # 路由配置目录
│   └── index.js        # 路由规则（模块路由/权限路由）
├── utils/              # 工具函数目录
│   └── request.js      # Axios 封装（请求/响应拦截/基础配置）
├── views/              # 页面级组件目录
│   ├── subject/        # 学科管理页面（列表/新增/编辑/详情）
│   ├── dept/           # 部门管理页面（列表/新增/编辑/详情）
│   ├── clazz/          # 班级管理页面（列表/新增/编辑/详情）
│   └── ...             # 其他业务页面
├── App.vue             # 根组件（全局布局/路由出口）
└── main.js             # 项目入口（Vue 实例创建/全局配置）
```

# 核心接口规范

## 接口封装原则

- 所有业务接口统一放置在 `src/api/` 目录，按模块拆分文件（如 `sub.js` 对应学科、`dept.js` 对应部门）；
- 接口函数基于 `@/utils/request.js` 封装的 Axios 实例实现，自动继承请求/响应拦截能力（如 Token 携带、统一错误处理）；
- 接口命名语义化：`[动作] + Api`（如 `queryAllApi` 全量查询、`addApi` 新增、`updateApi` 修改）；
- 路径参数使用 ES6 模板字符串拼接，请求体参数直接传入，与后端 RESTful 接口规范对齐。

## 核心接口示例（学科管理 | src/api/sub.js）

```javascript
import RequestApi from '@/utils/request.js';

// 查询所有学科列表
export const queryAllApi = () => RequestApi.get('/subjects');

// 修改学科信息
export const updateApi = (subject) => RequestApi.put('/subjects', subject);

// 删除指定学科（路径参数传ID）
export const deleteApi = (id) => RequestApi.delete(`/subjects/${id}`);

// 添加新学科
export const addApi = (subject) => RequestApi.post('/subjects', subject);

// 按ID查询学科（回显/详情，路径参数传ID）
export const queryByIdApi = (id) => RequestApi.get(`/subjects/${id}`);
```

## 接口调用示例

```javascript
// 以学科管理为例，在页面组件中调用接口
import { queryAllApi, addApi } from '@/api/sub.js';

// 全量查询学科列表
const getSubjectList = async () => {
  try {
    const res = await queryAllApi();
    console.log('学科列表：', res.data);
  } catch (err) {
    console.error('查询失败：', err.message);
  }
};

// 新增学科
const addSubject = async (newSubject) => {
  try {
    await addApi(newSubject);
    alert('学科新增成功！');
    // 新增后重新查询列表
    getSubjectList();
  } catch (err) {
    alert('新增失败：' + err.message);
  }
};
```

# 全局请求工具（src/utils/request.js）

## 核心功能

- 配置基础请求地址（baseURL），适配开发/生产环境的接口地址切换；
- 请求拦截器：统一添加 Token、Content-Type 等请求头，实现权限校验前置处理；
- 响应拦截器：统一处理后端返回码（如 401 未登录、403 无权限、500 服务器错误），简化业务层异常处理；
- 通用配置：超时时间设置、跨域请求处理、请求取消机制等。

## 基础配置示例

```javascript
import axios from 'axios';

// 创建 Axios 实例
const RequestApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量读取接口前缀
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
RequestApi.interceptors.request.use(
  (config) => {
    // 自动携带 Token（示例）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
RequestApi.interceptors.response.use(
  (response) => response.data, // 直接返回响应体
  (error) => {
    // 统一错误处理
    if (error.response.status === 401) {
      alert('登录已过期，请重新登录');
      // 跳转至登录页（需结合路由）
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default RequestApi;
```

# 开发规范

## 1. 代码风格

- 遵循 ESLint + Prettier 配置，提交代码前执行 `npm run lint` 修复规范问题；
- Vue 组件优先使用 `<script setup>` 语法，减少冗余代码；
- 变量/函数命名语义化：驼峰命名（如 `getSubjectList`），避免拼音/无意义命名。

## 2. 接口开发

- 接口文件按业务模块拆分，禁止所有接口写在同一个文件；
- 接口函数仅做请求封装，不包含业务逻辑；
- 异步请求必须添加异常捕获（`try/catch` 或 `.catch`）。

## 3. 资源管理

- 小马宝莉主题资源统一放在 `src/assets/pony/` 目录，按类型拆分（图片/样式）；
- 静态图片优先使用相对路径，避免绝对路径导致部署问题。

# 部署说明

## 1. 打包构建

```bash
# 生成生产环境打包文件（输出至 dist 目录）
npm run build
```

## 2. 服务器部署

将 `dist` 目录上传至 Nginx/Apache 等 Web 服务器；
配置 Nginx 反向代理解决跨域问题（示例）：

```nginx
server {
    listen 80;
    server_name ponyville-school.com; # 自定义域名
    root /usr/share/nginx/html/dist; # 打包文件存放路径
    index index.html;

    # 解决前端路由刷新404问题
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理接口请求（解决跨域）
    location /subjects {
        proxy_pass http://后端接口地址; # 替换为实际后端地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # 其他模块接口代理（部门/班级）
    location /depts {
        proxy_pass http://后端接口地址;
    }
    location /clazzs {
        proxy_pass http://后端接口地址;
    }
}
```

# 注意事项

- 学科/部门/班级的删除接口参数格式（路径参数/查询参数）需与后端严格对齐；
- 小马宝莉主题资源仅用于非商业场景，需注意版权合规；
- 生产环境部署时，需关闭前端控制台日志、启用接口请求加密（如 Token 校验）。

# 扩展说明

本项目支持快速扩展新的业务模块，扩展流程：
1. 在 `src/api/` 目录新增对应模块的接口文件；
2. 在 `src/views/` 目录开发模块页面组件；
3. 在路由配置中新增模块路由规则；
4. 复用 `src/utils/request.js` 统一请求工具，无需重复封装。



# PonyVille School Management System (Frontend)
PonyVille-School-Management is a frontend project of a comprehensive campus management system themed on *My Little Pony*, built with Vue 3 + Vite. It covers multi-dimensional core campus business modules such as subjects, departments, and classes, providing standardized CRUD (Create, Read, Update, Delete), detail echo, pagination query, and other functions. It combines thematic visual design with standardized frontend engineering implementation.

## Project Overview
### Core Positioning
A one-stop frontend solution for campus management scenarios, focusing on core management modules including subjects, departments, and classes. It realizes the full lifecycle management of business data, adapts to the actual business processes of campus management, and reduces operational thresholds and improves user experience through the My Little Pony-themed style.

### Core Technology Stack
| Technology/Tool       | Version/Core Purpose                     |
|-----------------------|------------------------------------------|
| Frontend Framework    | Vue 3 (Composition API + `<script setup>`) |
| Build Tool            | Vite (Ultra-fast hot update, lightweight packaging) |
| Routing Management    | Vue Router 4 (Page routing configuration / Permission control) |
| Network Request       | Axios (Encapsulated unified request tool with interceptors) |
| Code Specification    | ESLint + Prettier (Optional, ensuring unified code style) |
| Runtime Environment   | Node.js ≥ 16.x (LTS version recommended) |

### Core Business Modules
| Module Name           | Core Functions                                                                 |
|-----------------------|--------------------------------------------------------------------------------|
| Subject Management    | Query all subject lists, add new subjects, modify subject information, delete specified subjects, query subjects by ID (echo) |
| Department Management | Query all department lists, add new departments, modify department information, delete specified departments, query departments by ID (echo) |
| Class Management      | Conditional pagination query for classes, query all classes, detail query, add/edit/delete classes (extended module) |
| (Extendable)          | Grade management, permission management, and other core campus business modules |

## Quick Start
### Environment Preparation
1. Install Node.js (v16.x or above recommended), which comes with the npm package management tool;
2. Recommended development tools: VSCode + Volar plugin (disable Vetur) + TypeScript Vue Plugin (Volar);
3. Ensure the backend API service is running, and the `baseURL` configured in the frontend request tool is consistent with the backend address.

### Installation and Running
```bash
# Clone the project
Copy the clone address yourself

# Install project dependencies
npm install

# Start the development environment (default port: 5173, modifiable in vite.config.js)
npm run dev

# Build for production environment (packaged products output to the dist directory)
npm run build

# (Optional) ESLint code check and automatic repair
npm run lint
```

## Project Directory Structure
```plaintext
src/
├── api/                # API encapsulation directory (split by business module)
│   ├── sub.js          # Subject management API (query/add/edit/delete/echo)
│   ├── dept.js         # Department management API (query/add/edit/delete/echo)
│   ├── clazz.js        # Class management API (pagination/query/add/edit/delete)
│   └── ...             # Other business module APIs
├── assets/             # Static resource directory
│   ├── pony/           # My Little Pony theme resources (images/styles/fonts)
│   ├── css/            # Global styles
│   └── img/            # General image resources
├── router/             # Routing configuration directory
│   └── index.js        # Routing rules (module routing/permission routing)
├── utils/              # Utility function directory
│   └── request.js      # Axios encapsulation (request/response interceptors/basic configuration)
├── views/              # Page-level component directory
│   ├── subject/        # Subject management pages (list/add/edit/detail)
│   ├── dept/           # Department management pages (list/add/edit/detail)
│   ├── clazz/          # Class management pages (list/add/edit/detail)
│   └── ...             # Other business pages
├── App.vue             # Root component (global layout/routing outlet)
└── main.js             # Project entry (Vue instance creation/global configuration)
```

## Core API Specifications
### API Encapsulation Principles
1. All business APIs are uniformly placed in the `src/api/` directory and split into files by module (e.g., `sub.js` for subjects, `dept.js` for departments);
2. API functions are implemented based on the Axios instance encapsulated in `@/utils/request.js`, automatically inheriting request/response interception capabilities (such as Token carrying, unified error handling);
3. Semantic naming for APIs: `[Action] + Api` (e.g., `queryAllApi` for full query, `addApi` for addition, `updateApi` for modification);
4. Path parameters are spliced using ES6 template strings, and request body parameters are passed directly, aligning with the backend RESTful API specifications.

### Core API Example (Subject Management | src/api/sub.js)
```javascript
import RequestApi from '@/utils/request.js';

// Query all subject lists
export const queryAllApi = () => RequestApi.get('/subjects');

// Modify subject information
export const updateApi = (subject) => RequestApi.put('/subjects', subject);

// Delete the specified subject (pass ID as path parameter)
export const deleteApi = (id) => RequestApi.delete(`/subjects/${id}`);

// Add a new subject
export const addApi = (subject) => RequestApi.post('/subjects', subject);

// Query subject by ID (echo/detail, pass ID as path parameter)
export const queryByIdApi = (id) => RequestApi.get(`/subjects/${id}`);
```

### API Calling Example
```javascript
// Take subject management as an example to call APIs in page components
import { queryAllApi, addApi } from '@/api/sub.js';

// Query all subject lists
const getSubjectList = async () => {
  try {
    const res = await queryAllApi();
    console.log('Subject list:', res.data);
  } catch (err) {
    console.error('Query failed:', err.message);
  }
};

// Add a new subject
const addSubject = async (newSubject) => {
  try {
    await addApi(newSubject);
    alert('Subject added successfully!');
    // Re-query the list after addition
    getSubjectList();
  } catch (err) {
    alert('Failed to add subject: ' + err.message);
  }
};
```

## Global Request Tool (src/utils/request.js)
### Core Functions
1. Configure the base request address (`baseURL`) to adapt to API address switching between development/production environments;
2. Request interceptor: uniformly add request headers such as Token and Content-Type to implement preprocessing for permission verification;
3. Response interceptor: uniformly handle backend return codes (e.g., 401 Unauthorized, 403 Forbidden, 500 Server Error) to simplify exception handling at the business layer;
4. General configuration: timeout setting, cross-domain request handling, request cancellation mechanism, etc.

### Basic Configuration Example
```javascript
import axios from 'axios';

// Create Axios instance
const RequestApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Read API prefix from environment variables
  timeout: 5000, // Request timeout time
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// Request interceptor
RequestApi.interceptors.request.use(
  (config) => {
    // Automatically carry Token (example)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
RequestApi.interceptors.response.use(
  (response) => response.data, // Return response body directly
  (error) => {
    // Unified error handling
    if (error.response.status === 401) {
      alert('Login has expired, please log in again');
      // Redirect to login page (need to combine with routing)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default RequestApi;
```

## Development Specifications
### 1. Code Style
- Follow ESLint + Prettier configuration, run `npm run lint` to fix specification issues before submitting code;
- Prioritize using the `<script setup>` syntax for Vue components to reduce redundant code;
- Semantic naming for variables/functions: camelCase (e.g., `getSubjectList`), avoid pinyin/meaningless naming.

### 2. API Development
- Split API files by business module, prohibit writing all APIs in a single file;
- API functions only encapsulate requests and do not contain business logic;
- Asynchronous requests must add exception capture (`try/catch` or `.catch`).

### 3. Resource Management
- My Little Pony theme resources are uniformly placed in the `src/assets/pony/` directory, split by type (images/styles);
- Static images prefer relative paths to avoid deployment issues caused by absolute paths.

## Deployment Instructions
### 1. Package Building
```bash
# Generate production environment package files (output to the dist directory)
npm run build
```

### 2. Server Deployment
- Upload the `dist` directory to a web server such as Nginx/Apache;
- Configure Nginx reverse proxy to solve cross-domain issues (example):
```nginx
server {
    listen 80;
    server_name ponyville-school.com; # Custom domain name
    root /usr/share/nginx/html/dist; # Packaging file storage path
    index index.html;

    # Solve the 404 problem of frontend routing refresh
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy API requests (solve cross-domain)
    location /subjects {
        proxy_pass http://backend-api-address; # Replace with actual backend address
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Other module API proxies (departments/classes)
    location /depts {
        proxy_pass http://backend-api-address;
    }
    location /clazzs {
        proxy_pass http://backend-api-address;
    }
}
```

## Notes
- The parameter format (path parameter/query parameter) of the delete API for subjects/departments/classes must be strictly aligned with the backend;
- My Little Pony theme resources are only used for non-commercial scenarios, and attention should be paid to copyright compliance;
- When deploying in the production environment, disable frontend console logs and enable API request encryption (such as Token verification).

## Extension Instructions
This project supports rapid expansion of new business modules, with the expansion process as follows:
1. Add a new API file for the corresponding module in the `src/api/` directory;
2. Develop module page components in the `src/views/` directory;
3. Add new module routing rules in the routing configuration;
4. Reuse the unified request tool `src/utils/request.js` without repeated encapsulation.
