//axios基础的封装
import axios from "axios";
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
const router = useRouter();

const httpInstance = axios.create({
  baseURL: "http://pcapi-xiaotuxian-front-devtest.itheima.net",
  timeout: 5000,
});

//拦截器
//axios请求拦截器
httpInstance.interceptors.request.use(
  (config) => {
    //1.从pinia获取token数据
    const userStore = useUserStore();
    //2.按照后端要求拼接token数据
    const token = userStore.userInfo.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (e) => Promise.reject(e)
);

//axios响应式拦截器
httpInstance.interceptors.response.use(
  (res) => res.data,
  (e) => {
    //登录统一错误提示
    ElMessage({
      type: "warning",
      message: e.response.data.message,
    });

    //401token失效处理
    if (e.response.status === 401) {
      //1.清除本地用户数据
      const userStore = useUserStore();
      userStore.clearUserInfo();
      //2.跳转到登录页
      router.push("/login");
    }
    return Promise.reject(e);
  }
);
export default httpInstance;

//使用axios基础封装做的事情：
//1.响应拦截器实现登录时统一的错误提示
//2.请求拦截器实现向http请求头中拼接token数据
//3.解决token失效报401状态码
