mkdir vendor
git clone https://github.com/neovim/neovim vendor/neovim
cd vendor/neovim && make CMAKE_BUILD_TYPE=RelWithDebInfo
sudo make install
cd ../../
while true
  read -l -P 'Do you want to remove the cloned neovim repository? [y/N] ' yn
  switch $yn
    case Y y
      rm -rf vendor/neovim/
    case '' N n
      break
  end
end
