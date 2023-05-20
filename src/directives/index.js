//定义懒加载插件
import { useIntersectionObserver } from '@vueuse/core' 

export const lazyPlugin={
    install(app){
        app.directive('img-lazy',{
            mounted(el,binding){
                //el:指令绑定的那个元素
                //binding：binding.value 指令等于号后面绑定的表达式的值  图片url
                
                //vueUse提供的useIntersectionObserver函数来判断元素是否进入到视口区
                const {stop}=useIntersectionObserver(
                    el,
                    ([{ isIntersecting }]) => {
                        console.log(isIntersecting);
                        if(isIntersecting){
                            //进入了视口区域
                            el.src=binding.value
                            stop()
                        }
                    },  
                  )
            },
        })
    }
}