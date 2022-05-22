import React, { Component } from "react";
import _ from "lodash";
import "./AudioPlay.css";
import "../static/style.css";

class AudioPlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPause: false,
      musicList: props.musicList || [],
      currentMusic: props.musicList ? props.musicList[0] : {},
      totalTime: "00:00",
      currentTime: "00:00",
      processItemMove: false,
      volumeProcessItemMove: false,
      volumeControl: false,
      playMode: 1,
      isMusicListShow: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { currentMusic, musicList: prevMusicList } = prevState;
    const { musicList = [] } = nextProps;
    if (!_.isEqual(musicList, prevMusicList)) {
      const oldIndex = prevMusicList.findIndex(item => {
        return currentMusic.id === item.id;
      });
      const hasCurrentMusic = musicList.findIndex(item => {
        return currentMusic.id === item.id;
      });
      let newCurrentMusic = musicList[oldIndex]
        ? musicList[oldIndex]
        : musicList[0];
      if (musicList.length === 0) {
        newCurrentMusic = currentMusic;
      }
      return {
        musicList,
        currentMusic: hasCurrentMusic === -1 ? newCurrentMusic : currentMusic
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.currentMusic.id !== this.state.currentMusic.id) {
      this.resetProcess();
      if (this.state.isPause) {
        this.onPlay();
      }
    }
  }

  componentDidMount() {
    const audio = this.audio;
    audio.addEventListener("canplay", () => {
      const totalTime = parseInt(audio.duration);
      this.setState({
        totalTime: this.getTime(totalTime)
      });
    });

    audio.addEventListener("timeupdate", () => {
      const { processItemMove } = this.state;
      const currentTime = parseInt(audio.currentTime);
      const buffered = audio.buffered;
      let bufferTime = 0;
      if (buffered.length !== 0) {
        bufferTime = buffered.end(buffered.length - 1);
      }
      const bufferWidth = 500 * (bufferTime / audio.duration);
      const playWidth = 500 * (audio.currentTime / audio.duration);
      if (!processItemMove) {
        this.processPlayed.style.width = `${playWidth}px`;
        this.processItem.style.left = `${playWidth - 4}px`;
        this.setState({
          currentTime: this.getTime(currentTime)
        });
      }
      this.processBuffered.style.width = `${bufferWidth}px`;
    });

    audio.addEventListener("ended", () => {
      this.endedPlayMusic();
    });
    this.initVolumeProcess();
  }

  getTime = time => {
    if (time) {
      const minute = parseInt((time / 60) % 60);
      const second = parseInt(time % 60);
      let minuteText = `${minute}`;
      let secondText = `${second}`;
      if (minute < 10) {
        minuteText = `0${minute}`;
      }
      if (second < 10) {
        secondText = `0${second}`;
      }
      return `${minuteText}:${secondText}`;
    } else {
      return "00:00";
    }
  };

  // 播放
  onPlay = () => {
    const audio = this.audio;
    this.setState({ isPause: true });
    audio.play();
  };

  // 暂停
  onPause = () => {
    const audio = this.audio;
    this.setState({ isPause: false });
    audio.pause();
  };

  // 点击进度条
  onProcessClick = e => {
    this.setProcess(e, "click");
  };

  setProcess = (e, key) => {
    let offsetWidth = e.pageX - this.processPlayed.getBoundingClientRect().left;
    if (offsetWidth < 0) {
      offsetWidth = 0;
    }
    if (offsetWidth > this.process.offsetWidth) {
      offsetWidth = this.process.offsetWidth;
    }
    const offsetPercentage = offsetWidth / this.process.offsetWidth;
    const currentTime = this.audio.duration * offsetPercentage;
    if (key === "click" || key === "dragMove") {
      this.processPlayed.style.width = `${offsetWidth}px`;
      this.processItem.style.left = `${offsetWidth - 4}px`;
      this.setState({ currentTime: this.getTime(currentTime) });
    }
    if (key === "dragEnd" || key === "click") {
      this.audio.currentTime = currentTime;
    }
  };

  onProcessItemMouseDown = e => {
    e.stopPropagation();
    this.setState({ processItemMove: true });
  };
  onProcessItemMouseMove = e => {
    e.stopPropagation();
    const { processItemMove } = this.state;
    if (processItemMove) {
      this.setProcess(e, "dragMove");
    }
  };
  onProcessItemMouseUp = e => {
    const { processItemMove } = this.state;
    e.stopPropagation();

    if (processItemMove) {
      this.setState({ processItemMove: false });

      this.setProcess(e, "dragEnd");
    }
  };

  endedPlayMusic = () => {
    const { playMode, currentMusic } = this.state;
    const { musicList } = this.state;
    if (musicList.length > 0 && currentMusic) {
      const currentIndex = musicList.findIndex(item => {
        return item.id === currentMusic.id;
      });
      if (playMode === 1) {
        if (musicList[currentIndex + 1]) {
          this.setState({ currentMusic: musicList[currentIndex + 1] }, () => {
            this.onSwitchAction();
          });
        } else {
          this.setState({ currentMusic: musicList[0] }, () => {
            this.onSwitchAction();
          });
        }
      }
      else if (playMode === 2) {
        const randomIndex = Math.floor(Math.random() * 3 + 1);
        if (musicList[randomIndex + 1]) {
          this.setState({ currentMusic: musicList[randomIndex + 1] }, () => {
            this.onSwitchAction();
          });
        } else {
          this.setState({ currentMusic: musicList[0] }, () => {
            this.onSwitchAction();
          });
        }
      }
      else if (playMode === 3) {
        this.onSwitchAction();
      }
    } else {
      this.onSwitchAction();
    }
  };

  nextMusic = () => {
    const { currentMusic } = this.state;
    const { musicList } = this.state;
    if (musicList.length > 1 && currentMusic) {
      const currentIndex = musicList.findIndex(item => {
        return item.id === currentMusic.id;
      });
      if (musicList[currentIndex + 1]) {
        this.setState({ currentMusic: musicList[currentIndex + 1] }, () => {
          this.onSwitchAction();
        });
      } else {
        this.setState({ currentMusic: musicList[0] }, () => {
          this.onSwitchAction();
        });
      }
    } else {
      this.audio.currentTime = 0;
      this.onSwitchAction();
    }
  };
  previousMusic = () => {
    const { currentMusic } = this.state;
    const { musicList } = this.state;
    if (musicList.length > 1 && currentMusic) {
      const currentIndex = musicList.findIndex(item => {
        return item.id === currentMusic.id;
      });
      if (musicList[currentIndex - 1]) {
        this.setState({ currentMusic: musicList[currentIndex - 1] }, () => {
          this.onSwitchAction();
        });
      } else {
        this.setState({ currentMusic: musicList[musicList.length - 1] }, () => {
          this.onSwitchAction();
        });
      }
    } else {
      this.audio.currentTime = 0;
      this.onSwitchAction();
    }
  };

  onSwitchAction = () => {
    const { isPause } = this.state;
    this.resetProcess();
    if (isPause) {
      this.onPlay();
    }
  };

  resetProcess = () => {
    this.processPlayed.style.width = "0px";
    this.processItem.style.left = "-4px";
  };

  onVolumeControl = () => {
    const { volumeControl } = this.state;
    this.setState({ volumeControl: !volumeControl });
  };


  onVolumeControlHide = () => {
    const { volumeControl } = this.state;
    if (volumeControl) {
      this.setState({ volumeControl: false });
    }
  };
  
  initVolumeProcess = () => {

    const processLength = this.volumeProcess.offsetHeight;
    this.volumeProcessCurrent.style.height = `${processLength / 2}px`;
    this.volumeProcessItem.style.bottom = `${processLength / 2 - 6}px`;
    this.audio.volume = 0.5;
  };


  onVolumeProcessSet = e => {
    const processLength = this.volumeProcess.offsetHeight;
    let volumeOffsetHeight =
      processLength -
      (e.pageY - this.volumeProcess.getBoundingClientRect().top);
    let volumepercentage = 0;
    if (volumeOffsetHeight < 0) {
      volumeOffsetHeight = 0;
    }
    if (volumeOffsetHeight > processLength) {
      volumeOffsetHeight = processLength;
    }
    volumepercentage = volumeOffsetHeight / processLength;
    this.volumeProcessCurrent.style.height = `${volumeOffsetHeight}px`;
    this.volumeProcessItem.style.bottom = `${volumeOffsetHeight - 6}px`;
    this.audio.volume = volumepercentage;
  };

  onVolumeProcessItemMouseDown = () => {
    this.setState({ volumeProcessItemMove: true });
  };

  onVolumeProcessItemMouseUp = e => {
    const { volumeProcessItemMove } = this.state;
    if (volumeProcessItemMove) {
      this.setState({ volumeProcessItemMove: false });
    }
  };

  onVolumeProcessItemMove = e => {
    const { volumeProcessItemMove } = this.state;
    if (volumeProcessItemMove) {
      this.onVolumeProcessSet(e);
    }
  };

  onPlayModeChange = () => {
    const { playMode } = this.state;
    if (playMode === 3) {
      this.setState({ playMode: 1 });
    } else {
      this.setState({ playMode: playMode + 1 });
    }
  };

  onMusicList = () => {
    const { isMusicListShow } = this.state;
    this.setState({ isMusicListShow: !isMusicListShow });
  };

  onDeleteMusic = (e, item) => {
    e.stopPropagation();
    const { onDeleteMusic } = this.props;
    if (onDeleteMusic) {
      onDeleteMusic(item.id);
    }
  };

  onDeleteAllMusic = () => {
    const { onDeleteAllMusic } = this.props;
    if (onDeleteAllMusic) {
      onDeleteAllMusic();
    }
  };


  onMusicListItemClick = id => {
    const { musicList } = this.state;
    const { currentMusic } = this.state;
    const index = musicList.findIndex(item => {
      return item.id === id;
    });
    if (index !== -1) {
      if (currentMusic.id === id) {
        this.resetProcess();
        this.audio.currentTime = 0;
        this.onPlay();
      } else {
        this.setState({ currentMusic: musicList[index] }, () => {
          this.resetProcess();
          this.onPlay();
        });
      }
    }
  };

  render() {
    const {
      currentMusic,
      isPause,
      totalTime,
      currentTime,
      volumeControl,
      playMode,
      isMusicListShow
    } = this.state;
    const { title, info, img, resource, id } = currentMusic || {};
    const { musicList } = this.state;
    let playModeIcon = "";
    switch (playMode) {
      case 1:
        playModeIcon = "icon-circulation-list";
        break;
      case 2:
        playModeIcon = "icon-circulation-random";
        break;
      case 3:
        playModeIcon = "icon-circulation-single";
        break;
      default:
        playModeIcon = "icon-circulation-list";
        break;
    }
    return (
      <div className="mainLayout">
        <div
          className="mainContent"
          onMouseMove={this.onProcessItemMouseMove}
          onMouseUp={this.onProcessItemMouseUp}
        >
          <div className="playContent">
   
            <div className="left-controler">
              <span
                className="icon-prev prev-next-icon"
                onClick={this.previousMusic}
              />
              {isPause ? (
                <span className="icon-pause playIcon" onClick={this.onPause} />
              ) : (
                <span className="icon-play playIcon" onClick={this.onPlay} />
              )}
              <span
                className="icon-next prev-next-icon"
                onClick={this.nextMusic}
              />
            </div>
            <div className="main-controler">
              <img src={img} alt="" className="thumbnail" />
              <div className="music-control">
                <div className="music-info">
                  <span className="title-info">{title}</span>
                  <span className="author-info">{info}</span>
                </div>
                <div className="process-time">
                  <div
                    className="process-wrapper"
                    onClick={this.onProcessClick}
                    ref={ref => (this.process = ref)}
                  >
                    <div className="process">
                      <div
                        className="progress-buffered"
                        ref={ref => (this.processBuffered = ref)}
                      />
                      <div
                        className="progress-played"
                        ref={ref => (this.processPlayed = ref)}
                      >
                        <div
                          className="process-item"
                          ref={ref => (this.processItem = ref)}
                          onMouseDown={this.onProcessItemMouseDown}
                        
                        >
                          <div className="process-item-inside" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="time">
                    <span className="current-time">{currentTime}</span>/
                    <span className="total-time">{totalTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="right-folder">
              <span className="icon-folder folder" onClick={this.onFolder} />
              <span className="icon-share share" onClick={this.onShare} />
            </div>
        
            <div className="right-controler">
              <div
                className="volume-controler"
                style={{ visibility: volumeControl ? "visible" : "hidden" }}
                onMouseMove={this.onVolumeProcessItemMove}
                onMouseUp={this.onVolumeProcessItemMouseUp}
              >
                <div
                  className="volume-process"
                  onClick={this.onVolumeProcessSet}
                  ref={ref => (this.volumeProcess = ref)}
                >
                  <div
                    className="volume-current"
                    ref={ref => (this.volumeProcessCurrent = ref)}
                  >
                    <div
                      className="volume-item"
                      ref={ref => (this.volumeProcessItem = ref)}
                      onMouseDown={this.onVolumeProcessItemMouseDown}
                      onMouseUp={this.onVolumeProcessItemMouseUp}
                    >
                      <div className="volume-item-inside" />
                    </div>
                  </div>
                </div>
              </div>
              <span
                className="icon-volume volume"
                onClick={this.onVolumeControl}
              />
              <span
                className={`${playModeIcon} circulation`}
                onClick={this.onPlayModeChange}
              />
              <span className="icon-list list" onClick={this.onMusicList} />
            </div>
            {/* 歌单组件 */}
            {isMusicListShow && (
              <div className="musicList">
                <div className="music-list-head">
                  <h4 className="music-list-head-title">
                    播放列表(
                    <span>
                      {musicList && musicList.length ? musicList.length : 0}
                    </span>
                    )
                  </h4>
                  <span
                    className="music-list-head-collect"
                    onClick={this.onCollect}
                  >
                    <span className="icon-addfile music-list-common-icon" />
                    <span className="music-list-common-text">收藏全部</span>
                  </span>
                  <span className="music-list-head-line" />
                  <span
                    className="music-list-head-clear"
                    onClick={this.onDeleteAllMusic}
                  >
                    <span className="icon-clear music-list-common-icon" />
                    <span className="music-list-common-text">清除</span>
                  </span>
                  <p className="music-list-head-name">{title}</p>
                  <span className="music-list-head-close">
                    <span
                      className="icon-close music-list-common-icon"
                      onClick={this.onMusicList}
                    />
                  </span>
                </div>
                <div className="music-list-body">
                  <div className="music-list-body-content">
                    <ul className="music-list-body-ul">
                      {musicList &&
                        musicList.length > 0 &&
                        musicList.map(item => {
                          return (
                            <li
                              className={`music-list-li ${id === item.id &&
                                "music-current"}`}
                              onClick={() => this.onMusicListItemClick(item.id)}
                              key={item.id}
                            >
                              <div className="col music-list-li-col-1">
                                {id === item.id && (
                                  <span className="play-triangle-icon icon-currentPlay" />
                                )}
                              </div>
                              <div className="col music-list-li-col-2">
                                <span className="music-list-li-text">
                                  {item.title}
                                </span>
                              </div>
                              <div className="col music-list-li-col-3">
                                <span
                                  className="icon-addfile music-list-action-icon"
                                  onClick={e => this.onAddFile(e, item)}
                                />
                                <span
                                  className="icon-share music-list-action-icon"
                                  onClick={e => this.onShareMusic(e, item)}
                                />
                                <span
                                  className="icon-download music-list-action-icon"
                                  onClick={e => this.onUploadMusic(e, item)}
                                />
                                <span
                                  className="icon-clear music-list-action-icon"
                                  onClick={e => this.onDeleteMusic(e, item)}
                                />
                              </div>
                              <div className="col music-list-li-col-4">
                                <span className="music-list-li-text">
                                  {item.info}
                                </span>
                              </div>
                              <div className="col music-list-li-col-5">
                                <span className="music-list-li-text">
                                  {item.time}
                                </span>
                              </div>
                              <div className="col music-list-li-col-6">
                                <span className="icon-link music-list-action-icon" />
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                  <div className="music-list-body-lyric">
                    暂无
                  </div>
                </div>
              </div>
            )}
            <audio src={resource} ref={ref => (this.audio = ref)} />
          </div>
        </div>
      </div>
    );
  }
}

export default AudioPlay;
