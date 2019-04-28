(function () {
//    模拟数据
//     页面刚加载就读取本地存储的歌曲列表
    let data=localStorage.getItem('mList')? JSON.parse(localStorage.getItem('mList')) : [];

    let searchData =[];

    //获取元素
    let  start = document.querySelector( '.start');
    let  next = document.querySelector( '.next');
    let  prev = document.querySelector( '.prev');
    let  audio = document.querySelector( 'audio');
    let  songSinger = document.querySelector( '.ctrl-bars-box span');
    let  logoImg = document.querySelector( '.logo img');
    let  listBox = document.querySelector( '.play-list-box ul');
    let  nowTime = document.querySelector( '.nowTime');
    let  totalTimeSpan = document.querySelector( '.totalTime');
    let  ctrlBars = document.querySelector( '.ctrl-bars');
    let  nowBars = document.querySelector( '.nowBars');
    let  ctrlBtn = document.querySelector( '.ctrl-btn');
    let  modelBtn = document.querySelector( '.mode');
    let  infoEl = document.querySelector( '.info');


    //变量

        let index =0;//标识当前播放歌曲
        let rotadeDeg = 0 ; //记录旋转角度
        let timer =null ;//保存定时器
        let  modeNum =0 ; // 0顺序播放 1 单曲循环 2 随机播放

    // 加载播放列表
    function loadPlayList() {
       if (data.length ){
           let str ='';// 用来累计播放项
           for (let i =0 ; i<data.length ; i++){
               str += '<li>';
               str +='<i> × </i>';
               str += '<span>';
               for (var j= 0;j<data[i].ar.length ;j++) {
                   str += data[i].ar[j].name+ '  ';
               }
               str +='</span>';
               str += '<span>'+ data[i].name +' </span>';

               str += '</li>'
           }
           listBox.innerHTML=str;
        }

    }
    loadPlayList();

    //请求服务器  - - 搜索歌曲
    $('.search').on('keydown',function (e) {
        if(e.keyCode ===13){
            //按下回车键
            $.ajax({
                url: 'https://api.imjad.cn/cloudmusic/',
                //参数
                data:{
                    type:'search',
                    s:this.value
                },
                success : function (data) {
                    searchData=data.result.songs;
                    var str ='';
                    for (var i=0; i<searchData.length; i++){
                        str +='<li>';
                        str +='<span class="left song">'+ searchData[i].name +'</span>';
                        str +='<span class="right singer">';
                        for (var j= 0;j<searchData[i].ar.length ;j++) {
                            str += searchData[i].ar[j].name+ '  ';
                        }
                        str +='</span>';
                        str +='</li>';

                    }
                    $('.searchUl').html(str);
                },
                error: function (err) {
                    console.log(err);
                }
            });
            this.value='';
        }
    })
    //将歌曲添加到播放列表
    $('.searchUl').on('click','li',function () {
        data.push(searchData[$(this).index()]);
        localStorage.setItem('mList',JSON.stringify(data))
        loadPlayList();
        loadNum();
        index = data.length-1;
        init();
        play();
    })


    //切换播放列表
   function cheekPlayList() {

       let playList = document.querySelectorAll( '.play-list-box li');
        for (let i =0 ; i<data.length ; i++){
            playList[i].className = '' ;
        }
       playList[index].className ='active';
   }
   //格式化时间
   function formatTime(time) {
       return time > 9 ? time :'0' +time;
   }

   //加载播放列表歌曲的数量
    function loadNum(){
       $('.play-list').html(data.length);
    }
    loadNum();
   //点击播放列表放歌
  $(listBox).on('click','li',function () {
       index =$(this).index();
       init();
       play();
  })

    //删除播放列表的歌曲
    $(listBox).on('click','i',function (e) {
        // console.log($(this).parent().index());
        data.splice($(this).parent().index(),1);
        localStorage.setItem('mList',JSON.stringify(data))
        loadPlayList();
        //阻止冒泡
        e.stopPropagation();
        loadNum();
    })

    // 初始化播放
    function init(){
        cheekPlayList()
        rotadeDeg =0;
        audio.src = 'http://music.163.com/song/media/outer/url?id='+ data[index].id +'.mp3 ';
        songSinger.innerHTML =data[index].name+' ----- ';
       let str ='';
       for (let i =0; i<data[index].ar.length;i++){
           str += data[index].ar[i].name + '  ';
       }
        logoImg.src =data[index].al.picUrl;
    }
    // 给audio设置播放路径
        init();
    // 播放音乐
    function play(){
        clearInterval(timer);
        audio.play();
        start.style.backgroundPositionY='-159px';
        timer=setInterval(function () {
            rotadeDeg++;
            logoImg.style.transform= 'rotate('+ rotadeDeg+'deg)';
        },30);
    }

    //取不重复的随机数
    function getRandomNum(){
        let  randomNum = Math.floor(Math.random()*data.length);
        if (randomNum ==index){
            randomNum =getRandomNum();
        }
        return randomNum;
    }

    // 播放和暂停

    start.addEventListener('click',function () {
        if (audio.paused){
            play();
        } else {
            clearInterval(timer);
            audio.pause();
            start.style.backgroundPositionY='-198px';
        }
    })
    //下一曲
    next.addEventListener('click',function () {
        index ++;
        index =index > data.length-1 ? 0:index;
        init();
        play();
    })

    //上一曲
    prev.addEventListener('click',function () {
        index --;
        index =index <0 ? data.length-1 :index;
        init();
        play();
    })
    //模式切换提示
     function info(str){
        infoEl.innerHTML =str;
        infoEl.style.display ='block';
        setTimeout(function () {
            infoEl.style.display = 'none';
        },1000)
     }


    // 切换播放模式
    modelBtn.addEventListener('click',function () {
            modeNum++;
            modeNum = modeNum > 2 ?  0:modeNum;
            switch (modeNum) {
                case 0:
                    info('顺序播放');
                     modelBtn.style.backgroundPositionX = '0px';
                     modelBtn.style.backgroundPositionY=  '-336px';
                    break;
                case 1:
                    info('单曲循环');
                    modelBtn.style.backgroundPositionX = '-64px';
                    modelBtn.style.backgroundPositionY=  '-336px';
                    break;
                case 2:
                    info('随机播放');
                    modelBtn.style.backgroundPositionX = '-64px';
                    modelBtn.style.backgroundPositionY=  '-240px';
                    break;

            }
    })

    audio.addEventListener('canplay',function () {
        //进度条总时长
        let totalTime = audio.duration;
        let totalM = parseInt(totalTime/60);
        let totalS = parseInt(totalTime%60);
        totalTimeSpan.innerHTML= formatTime(totalM) + ':' +formatTime(totalS);

        audio.addEventListener('timeupdate',function () {
            //进度条现在时长
            let currentTime = audio.currentTime;
            let currentM = parseInt(currentTime/60);
            let currentS = parseInt(currentTime%60);
            nowTime.innerHTML= formatTime(currentM) + ':' +formatTime(currentS);

            //进度条
            let barWidth = ctrlBars.clientWidth;
            let position = currentTime/totalTime*barWidth;
            nowBars.style.width = position + 'px';
            ctrlBtn.style.left = position -5+'px';
            
            if(audio.ended){
                switch (modeNum) {
                    //顺序播放
                    case 0:
                        next.click();
                        break;
                    //单曲循环
                    case 1:
                        init();
                        play();
                        break;

                     case 2:
                             index = getRandomNum();
                             init();
                             play();
                        break;

                }
            }
            
        })
        //快进
        ctrlBars.addEventListener( 'click', function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;


        })
    })


})();