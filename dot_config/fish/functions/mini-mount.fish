function mini-mount --description 'Mount the Mac mini home dir at ~/mnt/mini (uses ~/.ssh/config + 1Password agent)'
    # Mounts the mini's home directory. `volname` makes Finder show "mini"
    # instead of the long sshfs URL.
    set -l mp "$HOME/mnt/mini"
    set -l remote 'richards-mac-mini:'

    if mount | grep -q " on $mp "
        echo "mini-mount: already mounted at $mp"
        return 0
    end
    mkdir -p $mp
    sshfs $remote $mp \
        -o reconnect,follow_symlinks,defer_permissions,noappledouble,volname=mini
    or begin
        echo "mini-mount: sshfs failed (rc=$status)"
        return $status
    end
    echo "mini-mount: $mp → $remote ✓"
end
