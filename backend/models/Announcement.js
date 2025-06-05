class Announcement {
  constructor({
    id,
    title,
    content,
    type,
    status,
    start_date,
    end_date,
    priority,
    created_at,
    updated_at
  }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.type = type;
    this.status = status;
    this.start_date = start_date;
    this.end_date = end_date;
 this.priority = priority;
 this.created_at = created_at;
 this.updated_at = updated_at;
  }
}
module.exports = Announcement;
