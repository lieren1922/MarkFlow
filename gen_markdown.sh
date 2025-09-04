#!/bin/bash

# 检查参数
if [ $# -lt 2 ]; then
    echo "用法: $0 <输出文件名> <大小> [单位]"
    echo "支持的单位: KB, MB, GB (默认MB)"
    echo "例如: $0 report.md 2MB"
    exit 1
fi

filename="$1"
size="$2"
unit="${3:-MB}" # 默认单位为MB

# 转换大小为字节
case $unit in
    KB|kb) target_size=$((size * 1024)) ;;
    MB|mb) target_size=$((size * 1024 * 1024)) ;;
    GB|gb) target_size=$((size * 1024 * 1024 * 1024)) ;;
    *) echo "错误：不支持的单位 $unit" && exit 1 ;;
esac

# 检查文件是否存在
if [ -f "$filename" ]; then
    read -p "文件已存在，是否覆盖？(y/n) " -n 1 -r
    echo && [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
fi

# 生成基础模板（约1.2KB）
base_content=$(cat <<EOF
# 主标题

## 子标题

这是示例正文段落，包含多个句子来填充文件内容。本模板将重复生成以达到指定文件大小。适用于测试、备份或教学演示等场景。

### 功能特性
- 自动计算文件大小
- 保持Markdown有效格式
- 支持KB/MB/GB单位
- 自动处理文件覆盖

| 参数   | 值       |
|--------|----------|
| 文件名 | $filename |
| 目标大小 | ${size}${unit} |
| 生成时间 | $(date +"%Y-%m-%d %H:%M:%S") |

EOF
)

# 计算模板大小
base_size=$(printf "%s" "$base_content" | wc -c)

# 生成重复内容
printf "%s" "$base_content" > "$filename"
repeat=$((target_size / base_size))
for ((i=1; i<repeat; i++)); do
    printf "%s" "$base_content" >> "$filename"
done

# 处理剩余字节
remainder=$((target_size % base_size))
if [ $remainder -gt 0 ]; then
    # 生成补充内容
    supplement=$(printf "# 补充内容\n\n")
    remaining=$((remainder - ${#supplement}))
    
    if [ $remaining -gt 0 ]; then
        # 使用循环生成精确长度的文本
        filler=""
        while [ ${#filler} -lt $remaining ]; do
            filler+="填充内容以精确达到目标大小，保证文件完整性"
        done
        supplement+="${filler:0:remaining}"
    fi
    
    printf "%s" "$supplement" >> "$filename"
fi

# 确保最终大小准确
truncate -s $target_size "$filename"

# 验证结果
final_size=$(stat -f%z "$filename")
if [ $final_size -eq $target_size ]; then
    echo -e "\n✅ 成功生成文件：$filename"
    echo "文件大小：$(du -h "$filename" | cut -f1)"
    echo "内容预览："
    head -n 5 "$filename"
else
    echo -e "\n❌ 生成失败，实际大小 $final_size 字节，目标大小 $target_size 字节"
    exit 1
fi

