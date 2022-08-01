while true
  read -l -P 'Do you want to continue? [y/N] ' yn
  switch $yn
    case Y y
      rm -rf neovim/
    case '' N n
      break
  end
end
# git clone https://github.com/neovim/neovim

# cd neovim && make CMAKE_BUILD_TYPE=RelWithDebInfo
# sudo make install
