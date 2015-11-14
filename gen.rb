#!/usr/bin/env ruby

require 'fileutils'
require 'xcodeproj'

XML = <<eos
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleExecutable</key>
  <string>%{name}</string>
  <key>CFBundleIdentifier</key>
  <string>%{id}</string>
</dict>
</plist>
eos

def regen(path, name, id)
  project_path = File.join(path, name + '.xcodeproj')
  plist = File.join(project_path, 'Info.plist')

  FileUtils.rm_rf project_path
  Dir.mkdir project_path

  File.write(plist, XML % {name:name, id:id})

  project = Xcodeproj::Project.new(project_path)
  app_target = project.new_target(:application, name, :ios, '7.0')
  app_target.add_system_framework('SpriteKit')
  app_target.add_file_references(
    ([plist] + Dir.glob('*.swift')).map{|f|project.main_group.new_file(f)}
  )
  project.save()
  return project_path
end

def rebuild(path, project, name, id, rm=false)
  build_path = File.join(path, 'build')
  if rm then
    FileUtils.rm_rf build_path
  end
  vars = {
    build: build_path,
    path: path,
    project: project,
    name: name,
    id: id,
    sdk:'iphonesimulator',
  }
  if system('xcodebuild -project "%{project}" -sdk "%{sdk}"' % vars) then
    system('xcrun instruments -w "iPhone 6 (9.1)"')
    system('xcrun simctl uninstall booted "%{id}"' % vars)
    system('xcrun simctl install booted "%{build}/Release-%{sdk}/%{name}.app"' % vars) and
    system('xcrun simctl launch booted "%{id}"' % vars)
  end
end

full_path = File.expand_path File.dirname(__FILE__)
name = File.split(full_path).last
id = 'arkie.' + name
project = regen(full_path, name, id)
rebuild(full_path, project, name, id, ARGV.include?('-c'))
